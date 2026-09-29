'use client';

import React, { FC, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useIntegrationList } from '@postmill-ai/frontend/components/launches/helpers/use.integration.list';
import { useOverview } from '@postmill-ai/frontend/components/analytics/hooks/useOverview';
import { useDashboardSummary } from './hooks/useDashboardSummary';
import { LineChart } from '@postmill-ai/frontend/components/analytics/charts/line.chart';
import { EmptyState } from '@postmill-ai/frontend/components/analytics/kit/states';
import { DashboardSetup } from './dashboard.setup';
import { SectionCard } from './kit/section-card';
import { DashboardHeader } from './dashboard.header';
import { DashboardSectionMeta } from './customize.popover';
import { greetingForUser } from './dashboard.utils';
import { KpiStrip } from './widgets/kpi.strip';
import { ScheduleTimeline } from './widgets/schedule.timeline';
import { CampaignsWidget } from './widgets/campaigns.widget';
import { InboxWidget } from './widgets/inbox.widget';
import { MediaQueueWidget } from './widgets/media.queue';
import { UsageWidget } from './widgets/usage.widget';
import { RecommendationsStrip } from './widgets/recommendations.strip';
import { AttentionFeed } from './widgets/attention.feed';
import { useAiActive } from '@postmill-ai/frontend/components/layout/use-ai-active';
import { DailyBrief } from './widgets/daily.brief';
import { useT } from '@postmill-ai/react/translation/get.transation.service.client';
import { useAttention } from './hooks/useAttention';
import { useMediaJobs } from './hooks/useMediaJobs';
import { usePermissions } from '@postmill-ai/frontend/components/layout/use-permissions';
import { ANALYTICS_USAGE_HREF, MEDIA_QUEUE_HREF } from './destinations';

export { greetingForUser };

interface WorkflowStep {
  key: string;
  label: string;
  complete: boolean;
}

const WorkflowStepper: FC<{ steps: WorkflowStep[] }> = ({ steps }) => {
  const currentIndex = steps.findIndex((s) => !s.complete);
  const current = currentIndex === -1 ? steps.length : currentIndex;

  return (
    <div className="flex items-center gap-[4px] overflow-x-auto pb-[4px]">
      {steps.map((step, idx) => {
        const isCurrent = idx === current;
        const isComplete = step.complete;

        return (
          <React.Fragment key={step.key}>
            {idx > 0 && (
              <div
                className={`h-[2px] w-[20px] shrink-0 rounded-full transition-colors ${
                  idx <= current ? 'bg-btnPrimary' : 'bg-newTableBorder'
                }`}
              />
            )}
            <div className="flex items-center gap-[6px] shrink-0">
              <div
                className={[
                  'w-[20px] h-[20px] rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors',
                  isComplete
                    ? 'bg-btnPrimary text-white'
                    : isCurrent
                      ? 'bg-btnPrimary/10 text-btnPrimary ring-2 ring-btnPrimary/20'
                      : 'bg-newTableHeader text-newTableText',
                ].join(' ')}
              >
                {isComplete ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={[
                  'text-[12px] font-medium transition-colors',
                  isComplete
                    ? 'text-textColor'
                    : isCurrent
                      ? 'text-btnPrimary'
                      : 'text-newTableText',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const DashboardComponent = () => {
  const [briefOpen, setBriefOpen] = useState(false);
  const aiActive = useAiActive();
  const t = useT();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: integrations } = useIntegrationList();
  // Same SWR keys the widgets use, so these are cache reads, not extra requests.
  const { data: attention } = useAttention();
  // Same optimistic gate SectionCard applies to the media widget: fetch until
  // permissions resolve, then stop if the user lacks media:read — otherwise a
  // restricted user's dashboard fires (and SWR retries) a 403 on every mount.
  const permissions = usePermissions();
  const canReadMedia =
    !permissions.isResolved || permissions.hasPermission('media', 'read');
  const { data: mediaJobs } = useMediaJobs(canReadMedia);

  const DASHBOARD_SECTIONS: DashboardSectionMeta[] = useMemo(
    () => [
      { id: 'setup', label: t('setup_checklist_label', 'Setup checklist') },
      { id: 'attention', label: t('needs_attention', 'Needs attention') },
      {
        id: 'kpi',
        label: t('kpi_at_a_glance', 'At a glance'),
        permission: ['analytics', 'read'],
      },
      {
        id: 'trend',
        label: t('trend_label', 'Engagement trend'),
        permission: ['analytics', 'read'],
      },
      {
        id: 'schedule',
        label: t('next_7_days', 'Next 7 days'),
        permission: ['posts', 'read'],
      },
      {
        id: 'campaigns',
        label: t('active_campaigns', 'Active campaigns'),
        permission: ['posts', 'read'],
      },
      { id: 'inbox', label: t('inbox', 'Inbox'), permission: ['comments', 'read'] },
      {
        id: 'media',
        label: t('media_queue', 'Media queue'),
        permission: ['media', 'read'],
      },
      {
        id: 'usage',
        label: t('usage_budget', 'Usage & budget'),
        permission: ['billing', 'read'],
      },
      {
        id: 'recommendations',
        label: t('recommendations_label', 'Recommendations'),
        permission: ['posts', 'read'],
      },
      {
        id: 'brief',
        label: t('daily_brief_section_label', 'Daily brief'),
        permission: ['analytics', 'read'],
      },
    ],
    [t]
  );

  const activeIntegrationIds = useMemo(
    // Array guard: `/integrations/list` is a shared SWR key — a non-array in
    // the cache must never crash the page (Sentry POSTMILL-APP-E).
    () => (Array.isArray(integrations) ? integrations : []).map((i: { id: string }) => i.id),
    [integrations]
  );

  const from = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
  const to = dayjs().format('YYYY-MM-DD');

  const { data: overviewData, isLoading: overviewLoading } = useOverview({
    from,
    to,
    integrations: activeIntegrationIds,
    compare: false,
  });

  const mainKPI = overviewData?.kpis?.[0];
  const series = useMemo(() => {
    if (!overviewData?.series || !mainKPI) return [];
    const points = overviewData.series[mainKPI.metric] || [];
    return points.map((p) => ({ ...p, date: dayjs(p.date).format(t('chart_date_format', 'M/DD')) }));
  }, [overviewData, mainKPI, t]);

  const hasOverview = !!overviewData && series.length > 0;

  const workflowSteps: WorkflowStep[] = useMemo(
    () => [
      {
        key: 'plan',
        label: t('workflow_plan', 'Plan'),
        complete: (summary?.channelsConnected ?? 0) > 0,
      },
      {
        key: 'create',
        label: t('workflow_create', 'Create'),
        complete: (summary?.totalPosts ?? 0) > 0 || (summary?.drafts ?? 0) > 0,
      },
      {
        key: 'review',
        label: t('workflow_review', 'Review'),
        complete: (summary?.scheduledPosts ?? 0) > 0,
      },
      {
        key: 'schedule',
        label: t('workflow_schedule', 'Schedule'),
        complete: (summary?.scheduledPosts ?? 0) > 0,
      },
      {
        key: 'publish',
        label: t('workflow_publish', 'Publish'),
        complete: (summary?.publishedNext7 ?? 0) > 0,
      },
      {
        key: 'analyze',
        label: t('workflow_analyze', 'Analyze'),
        complete: (summary?.publishedNext7 ?? 0) > 0,
      },
    ],
    [summary, t]
  );

  return (
    <div className="p-[16px] mobile:p-[24px] overflow-x-hidden">
      <DashboardHeader
        sections={DASHBOARD_SECTIONS}
        showBriefButton={aiActive === true}
        onBriefClick={() => setBriefOpen((o) => !o)}
      />

      <div className="mb-[16px]">
        <WorkflowStepper steps={workflowSteps} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[12px]">
        <div className="lg:col-span-12 order-first lg:order-1">
          <DailyBrief open={briefOpen} onOpenChange={setBriefOpen} />
        </div>

        <div className="lg:col-span-12 order-first lg:order-1">
          <DashboardSetup />
        </div>

        <div className="lg:col-span-12 order-1 lg:order-2">
          <SectionCard
            id="attention"
            title={t('needs_attention', 'Needs attention')}
            badge={attention?.items?.length}
          >
            <AttentionFeed />
          </SectionCard>
        </div>

        <div className="lg:col-span-12 order-2 lg:order-5">
          <SectionCard
            id="schedule"
            title={t('next_7_days', 'Next 7 days')}
            viewAllHref="/posts"
            permission={['posts', 'read']}
          >
            {summaryLoading ? (
              <div className="animate-pulse h-[40px] bg-newTableHeader rounded-[4px]" />
            ) : (
              <ScheduleTimeline upcomingPosts={summary?.upcomingPosts ?? []} />
            )}
          </SectionCard>
        </div>

        <div className="lg:col-span-4 order-3 lg:order-3">
          <SectionCard
            id="kpi"
            title={t('kpi_at_a_glance', 'At a glance')}
            viewAllHref="/analytics"
            permission={['analytics', 'read']}
          >
            <KpiStrip
              from={from}
              to={to}
              integrationIds={activeIntegrationIds}
            />
          </SectionCard>
        </div>

        <div className="lg:col-span-8 order-4 lg:order-4">
          <SectionCard
            id="trend"
            title={t('trend_title', '7-day engagement')}
            viewAllHref="/analytics"
            permission={['analytics', 'read']}
          >
            {overviewLoading ? (
              <div className="h-[240px] bg-newTableHeader rounded-[12px] animate-pulse" />
            ) : hasOverview ? (
              <div className="h-[240px] relative w-full min-w-0">
                <LineChart series={series} height={240} format={mainKPI?.format} />
              </div>
            ) : (
              <EmptyState
                title={t('no_trend_data_title', 'No trend data yet')}
                description={t(
                  'no_trend_data_description',
                  'Publish posts and connect channels to see engagement over time.'
                )}
              />
            )}
          </SectionCard>
        </div>

        <div className="lg:col-span-6 order-6 lg:order-6">
          <SectionCard
            id="campaigns"
            title={t('active_campaigns', 'Active campaigns')}
            viewAllHref="/campaigns"
            permission={['posts', 'read']}
          >
            <CampaignsWidget />
          </SectionCard>
        </div>

        <div className="lg:col-span-6 order-5 lg:order-6">
          <SectionCard
            id="inbox"
            title={t('inbox', 'Inbox')}
            badge={summary?.commentUnreadCount}
            viewAllHref="/replies"
            permission={['comments', 'read']}
          >
            <InboxWidget />
          </SectionCard>
        </div>

        <div className="lg:col-span-6 order-7 lg:order-7">
          <SectionCard
            id="media"
            title={t('media_queue', 'Media queue')}
            badge={mediaJobs?.counts?.failed7d}
            viewAllHref={MEDIA_QUEUE_HREF}
            permission={['media', 'read']}
          >
            <MediaQueueWidget />
          </SectionCard>
        </div>

        <div className="lg:col-span-6 order-8 lg:order-7">
          <SectionCard
            id="usage"
            title={t('usage_budget', 'Usage & budget')}
            viewAllHref={ANALYTICS_USAGE_HREF}
            permission={['billing', 'read']}
          >
            <UsageWidget />
          </SectionCard>
        </div>

        <div className="lg:col-span-12 order-9 lg:order-8">
          <SectionCard
            id="recommendations"
            title={t('recommendations_label', 'Recommendations')}
            viewAllHref="/analytics?tab=insights"
            permission={['posts', 'read']}
          >
            <RecommendationsStrip />
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
