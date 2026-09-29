'use client';

import { FC, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { useFetch } from '@postmill-ai/helpers/utils/custom.fetch';
import { useOverview } from './hooks/useOverview';
import { useIntegrationList } from '@postmill-ai/frontend/components/launches/helpers/use.integration.list';
import { Integrations } from '@postmill-ai/frontend/components/launches/calendar.context';
import { AnalyticsFilterBar } from './filters/filter.bar';
import { OverviewTab } from './views/overview.tab';
import { ChannelsTab } from './views/channels.tab';
import { PostsTab } from './views/posts.tab';
import { DrillBreadcrumb } from './drill/drill.breadcrumb';
import { DrillState, OverviewResponse } from './utils';
import { usePosts } from './hooks/usePosts';
import { ErrorBoundary } from './error.boundary';
import { ExportButton } from './export.button';
import { ShareButton } from './share.button';
import { CampaignBand } from './charts/line.chart';
import { InsightsTab } from './views/insights.tab';
import { WatchlistTab } from './views/watchlist.tab';
import { ShortlinksTab } from './views/shortlinks.tab';
import { UsageTab } from './views/usage.tab';
import { PostAnalyticsDrawer } from './post-analytics.drawer';
import { useT } from '@postmill-ai/react/translation/get.transation.service.client';
import { OverflowTabs } from '@postmill-ai/frontend/components/ui/overflow-tabs';

function getDefaultFrom(): string {
  return dayjs().subtract(30, 'day').format('YYYY-MM-DD');
}

function getDefaultTo(): string {
  return dayjs().format('YYYY-MM-DD');
}

function isDataEmpty(data: OverviewResponse | undefined): boolean {
  if (!data) return true;
  const hasKpis = !!data.kpis?.length;
  const hasSeries = !!data.series && Object.keys(data.series).length > 0;
  const hasChannels = !!data.byChannel?.length;
  return !hasKpis && !hasSeries && !hasChannels;
}

interface CampaignListItem {
  id: string;
  name: string;
  integrationIds?: string[];
  startDate?: string | null;
  endDate?: string | null;
  color?: string | null;
}

const useAnalyticsCampaigns = () => {
  const fetch = useFetch();
  return useSWR<CampaignListItem[]>('/campaigns', (url: string) =>
    fetch(url).then((r: Response) => r.json())
  );
};

export const AnalyticsDashboard: FC = () => {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get('from') || getDefaultFrom();
  const to = searchParams.get('to') || getDefaultTo();
  const compare = searchParams.get('compare') !== 'false';
  const rawTab = searchParams.get('tab') || 'overview';
  const legacyInsights = rawTab === 'best-time' || rawTab === 'recommendations';
  const tab = (legacyInsights ? 'insights' : rawTab) as DrillState['tab'];
  const insightsSection = legacyInsights
    ? rawTab
    : searchParams.get('section') || undefined;
  const drillMetric = searchParams.get('metric') || undefined;
  const focusIntegration = searchParams.get('focusIntegration') || undefined;
  const focusDate = searchParams.get('focusDate') || undefined;
  const focusPost = searchParams.get('focusPost') || undefined;

  const { data: integrationsData } = useIntegrationList();
  const integrations = useMemo(
    () => (Array.isArray(integrationsData) ? integrationsData : []) as Integrations[],
    [integrationsData]
  );
  const allIntegrationIds = useMemo(
    () => integrations.map((i) => i.id),
    [integrations]
  );
  const channels = useMemo(
    () =>
      integrations.map((i) => ({
        integrationId: i.id,
        name: i.name,
        identifier: i.identifier,
        picture: i.picture,
      })),
    [integrations]
  );

  const urlIntegrations = searchParams.get('integrations');
  const selectedChannels = useMemo(
    () => (urlIntegrations ? urlIntegrations.split(',') : []),
    [urlIntegrations]
  );

  const urlCampaigns = searchParams.get('campaigns');
  const selectedCampaigns = useMemo(
    () => (urlCampaigns ? urlCampaigns.split(',') : []),
    [urlCampaigns]
  );

  const { data: campaignData } = useAnalyticsCampaigns();
  const campaignList = useMemo(() => campaignData || [], [campaignData]);
  const campaigns = useMemo(
    () => campaignList.map((c) => ({ id: c.id, name: c.name })),
    [campaignList]
  );

  const campaignBands = useMemo<CampaignBand[]>(
    () =>
      campaignList
        .filter((c) => c.startDate)
        .map((c) => ({
          name: c.name,
          from: (c.startDate as string).slice(0, 10),
          to: c.endDate ? (c.endDate as string).slice(0, 10) : to,
          color: c.color || undefined,
        })),
    [campaignList, to]
  );

  const activeIntegrations = useMemo(
    () => (selectedChannels.length ? selectedChannels : allIntegrationIds),
    [selectedChannels, allIntegrationIds]
  );

  const {
    data: overviewData,
    isLoading: overviewLoading,
    error: overviewError,
  } = useOverview({
    from,
    to,
    integrations: activeIntegrations,
    compare,
    campaigns: selectedCampaigns,
  });

  const campaignScoped = overviewData?.scope === 'campaign-posts';

  const {
    data: postsData,
    isLoading: postsLoading,
    error: postsError,
  } = usePosts(
    tab === 'posts'
      ? {
          from,
          to,
          integrations: activeIntegrations,
          sort: searchParams.get('sort') || 'publishedAt',
          dir: (searchParams.get('dir') as 'asc' | 'desc') || 'desc',
          page: +(searchParams.get('page') || 1),
          limit: 25,
          campaigns: selectedCampaigns,
        }
      : undefined
  );

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.replace(`/analytics?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleChannelChange = useCallback(
    (ids: string[]) => {
      updateParams({
        integrations:
          ids.length && ids.length < allIntegrationIds.length
            ? ids.join(',')
            : undefined,
      });
    },
    [allIntegrationIds, updateParams]
  );

  const handleCampaignsChange = useCallback(
    (ids: string[]) => {
      updateParams({ campaigns: ids.length ? ids.join(',') : undefined });
    },
    [updateParams]
  );

  const handleRangeChange = useCallback(
    (range: { from: string; to: string; compare: boolean }) => {
      updateParams({
        from: range.from,
        to: range.to,
        compare: String(range.compare),
      });
    },
    [updateParams]
  );

  const handleTabChange = useCallback(
    (newTab: string) => {
      updateParams({ tab: newTab });
    },
    [updateParams]
  );

  const handleSelectMetric = useCallback(
    (metric: string) => {
      updateParams({ metric: metric || undefined });
    },
    [updateParams]
  );

  const handleSelectChannel = useCallback(
    (integrationId: string) => {
      updateParams({ focusIntegration: integrationId, tab: 'channels' });
    },
    [updateParams]
  );

  const handleSelectDate = useCallback(
    (date: string) => {
      if (date) {
        updateParams({
          focusDate: date,
          metric: drillMetric || overviewData?.kpis?.[0]?.metric,
        });
        return;
      }
      updateParams({ focusDate: undefined, metric: undefined });
    },
    [updateParams, drillMetric, overviewData]
  );

  const handleSelectPost = useCallback(
    (postId: string) => {
      updateParams({ focusPost: postId || undefined });
    },
    [updateParams]
  );

  const handleCloseFocusPost = useCallback(() => {
    updateParams({ focusPost: undefined, metric: undefined });
  }, [updateParams]);

  const handleReset = useCallback(() => {
    updateParams({
      metric: undefined,
      focusIntegration: undefined,
      focusDate: undefined,
      focusPost: undefined,
      tab: undefined,
    });
  }, [updateParams]);

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({ page: String(page) });
    },
    [updateParams]
  );

  const handleSortChange = useCallback(
    (sort: string, dir: 'asc' | 'desc') => {
      updateParams({ sort, dir, page: '1' });
    },
    [updateParams]
  );

  const showEmptyBlock =
    !overviewLoading &&
    !overviewError &&
    (tab === 'overview' || tab === 'channels') &&
    isDataEmpty(overviewData);

  const drill: DrillState = {
    metric: drillMetric,
    focusIntegration,
    focusDate,
    focusPost,
    tab,
  };
  const tabLabels: Record<string, string> = {
    overview: t('analytics_tab_overview', 'Overview'),
    channels: t('analytics_tab_channels', 'Channels'),
    posts: t('analytics_tab_posts', 'Posts'),
    insights: t('analytics_tab_insights', 'Insights'),
    shortlinks: t('analytics_tab_shortlinks', 'Links'),
    watchlist: t('analytics_tab_watchlist', 'Watchlist'),
    usage: t('analytics_tab_usage', 'Usage'),
  };

  const tabItems = (
    ['overview', 'channels', 'posts', 'insights', 'shortlinks', 'watchlist', 'usage'] as const
  ).map((key) => ({ key, label: tabLabels[key] }));

  const dateRangeLabel = useMemo(() => {
    const f = dayjs(from);
    const tt = dayjs(to);
    const days = tt.diff(f, 'day') + 1;
    if (days === 1) return f.format('MMM D, YYYY');
    if (days <= 7) return `${f.format('MMM D')} – ${tt.format('MMM D, YYYY')}`;
    if (days <= 31) return `${f.format('MMM D')} – ${tt.format('MMM D, YYYY')}`;
    return `${f.format('MMM D, YYYY')} – ${tt.format('MMM D, YYYY')}`;
  }, [from, to]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedChannels.length) count++;
    if (selectedCampaigns.length) count++;
    const defaultFrom = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
    const defaultTo = dayjs().format('YYYY-MM-DD');
    if (from !== defaultFrom || to !== defaultTo) count++;
    return count;
  }, [selectedChannels, selectedCampaigns, from, to]);

  return (
    <ErrorBoundary>
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="shrink-0 bg-newBgColor border-b border-newTableBorder">
          <div className="px-[24px] pt-[20px] pb-[16px] mobile:px-[16px] mobile:pt-[16px] mobile:pb-[12px]">
            <div className="flex items-start justify-between gap-[16px]">
              <div className="min-w-0">
                <div className="flex items-center gap-[10px] mb-[4px]">
                  <div className="w-[28px] h-[28px] rounded-[8px] bg-btnPrimary flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18" />
                      <path d="M7 14l4-4 4 3 5-6" />
                    </svg>
                  </div>
                  <h1 className="text-[20px] mobile:text-[18px] font-semibold tracking-tight text-textColor leading-[28px]">
                    {t('analytics_page_title', 'Analytics')}
                  </h1>
                </div>
                <p className="text-[13px] text-newTableText leading-[20px]">
                  {t(
                    'analytics_page_subtitle',
                    'Track performance across all your connected channels'
                  )}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-[8px] shrink-0">
                <span className="text-[12px] text-newTableText tabular-nums">
                  {dateRangeLabel}
                </span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-btnPrimary/10 text-btnPrimary text-[11px] font-medium">
                    <span className="w-[5px] h-[5px] rounded-full bg-btnPrimary" />
                    {activeFilterCount} {t('filters_active', 'active')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Filter Bar ─────────────────────────────────────────── */}
          <div className="px-[24px] pb-[12px] mobile:px-[16px] mobile:pb-[10px]">
            <AnalyticsFilterBar
              from={from}
              to={to}
              compare={compare}
              onRangeChange={handleRangeChange}
              integrations={integrations}
              selectedChannels={selectedChannels}
              onChannelsChange={handleChannelChange}
              campaigns={campaigns}
              selectedCampaigns={selectedCampaigns}
              onCampaignsChange={handleCampaignsChange}
              exportSlot={
                <div className="flex items-center gap-[8px]">
                  <ShareButton />
                  <ExportButton
                    from={from}
                    to={to}
                    integrations={activeIntegrations}
                    compare={compare}
                    campaigns={selectedCampaigns}
                  />
                </div>
              }
            />
          </div>
        </div>

        {/* ── Main Content ────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="px-[24px] py-[20px] mobile:px-[16px] mobile:py-[16px]">
            {campaignScoped && (
              <div className="flex items-center gap-[10px] mb-[16px] px-[14px] py-[10px] rounded-[10px] bg-amber-500/10 border border-amber-500/20 text-[13px] text-textColor">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500 shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
                </svg>
                <span>
                  {t(
                    'analytics_campaign_scope_note',
                    "Post metrics only — channel metrics like followers aren't campaign-scoped."
                  )}
                </span>
              </div>
            )}

            <DrillBreadcrumb
              drill={drill}
              onReset={handleReset}
              onNavigate={(updates) =>
                updateParams(updates as Record<string, string>)
              }
            />

            {/* ── Tab Navigation ─────────────────────────────────────── */}
            <div className="mb-[20px]">
              <OverflowTabs
                items={tabItems.map((item) => ({ key: item.key, label: item.label }))}
                activeKey={tab}
                onSelect={handleTabChange}
                ariaLabel={t('more_analytics_tabs', 'More analytics tabs')}
                listAriaLabel={t('analytics_tabs', 'Analytics tabs')}
              />
            </div>

            {/* ── Empty State ────────────────────────────────────────── */}
            {showEmptyBlock && (
              <div className="flex flex-col items-center justify-center py-[64px] px-[24px] bg-newBgColorInner border border-newTableBorder rounded-[16px]">
                <div className="w-[64px] h-[64px] rounded-[16px] bg-btnPrimary/10 flex items-center justify-center mb-[20px]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-btnPrimary">
                    <path d="M18 20V10" />
                    <path d="M12 20V4" />
                    <path d="M6 20v-6" />
                  </svg>
                </div>
                <div className="text-[18px] font-semibold text-textColor mb-[8px]">
                  {t('analytics_empty_title', 'No analytics data yet')}
                </div>
                <div className="text-[14px] text-newTableText text-center max-w-[440px] mb-[24px] leading-[22px]">
                  {t('analytics_empty_desc', 'Analytics appears after your first scheduled collection (requires connected channels and background jobs configured).')}
                </div>
                <Link
                  href="/settings/channels"
                  className="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-btnPrimary text-white text-[14px] font-medium rounded-[10px] hover:opacity-90 transition-opacity"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                  </svg>
                  {t('analytics_connect_channels', 'Connect channels')}
                </Link>
              </div>
            )}

            {/* ── Tab Content ────────────────────────────────────────── */}
            {tab === 'overview' && !showEmptyBlock && (
              <ErrorBoundary>
                <OverviewTab
                  data={overviewData}
                  loading={overviewLoading}
                  error={overviewError}
                  from={from}
                  to={to}
                  integrations={activeIntegrations}
                  compare={compare}
                  campaigns={selectedCampaigns}
                  campaignBands={campaignBands}
                  selectedMetric={drillMetric}
                  selectedDate={focusDate}
                  focusIntegration={focusIntegration}
                  onSelectMetric={handleSelectMetric}
                  onSelectDate={handleSelectDate}
                  onSelectChannel={handleSelectChannel}
                />
              </ErrorBoundary>
            )}
            {tab === 'channels' && !showEmptyBlock && (
              <ErrorBoundary>
                <ChannelsTab
                  data={overviewData}
                  loading={overviewLoading}
                  error={overviewError}
                  focusIntegration={focusIntegration}
                  from={from}
                  to={to}
                  compare={compare}
                  integrations={activeIntegrations}
                  channels={channels}
                  onSelectChannel={handleSelectChannel}
                />
              </ErrorBoundary>
            )}
            {tab === 'insights' && (
              <ErrorBoundary>
                <InsightsTab
                  integrations={activeIntegrations}
                  section={insightsSection}
                />
              </ErrorBoundary>
            )}
            {tab === 'watchlist' && (
              <ErrorBoundary>
                <WatchlistTab />
              </ErrorBoundary>
            )}
            {tab === 'usage' && (
              <ErrorBoundary>
                <UsageTab />
              </ErrorBoundary>
            )}
            {tab === 'shortlinks' && (
              <ErrorBoundary>
                <ShortlinksTab from={from} to={to} />
              </ErrorBoundary>
            )}
            {tab === 'posts' && (
              <ErrorBoundary>
                <PostsTab
                  posts={postsData?.posts}
                  total={postsData?.total || 0}
                  loading={postsLoading}
                  error={postsError}
                  page={+(searchParams.get('page') || 1)}
                  limit={25}
                  sort={searchParams.get('sort') || 'publishedAt'}
                  dir={(searchParams.get('dir') as 'asc' | 'desc') || 'desc'}
                  onPageChange={handlePageChange}
                  onSortChange={handleSortChange}
                />
              </ErrorBoundary>
            )}
          </div>
        </div>
      </div>
      {focusPost && (
        <PostAnalyticsDrawer
          postId={focusPost}
          open
          onClose={handleCloseFocusPost}
        />
      )}
    </ErrorBoundary>
  );
};
