'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { useUser } from '@postmill-ai/frontend/components/layout/user.context';
import { usePermissions } from '@postmill-ai/frontend/components/layout/use-permissions';
import { useVariables } from '@postmill-ai/react/helpers/variable.context';
import { useT } from '@postmill-ai/react/translation/get.transation.service.client';
import { useDashboardSummary } from '@postmill-ai/frontend/components/dashboard/hooks/useDashboardSummary';
import {
  SETTINGS_SECTION_ORDER,
  visibleSettingsNav,
  type SettingsNavItem,
} from '@postmill-ai/frontend/components/settings/settings-nav.config';

/**
 * The /settings landing.
 *
 * Cards come from the same `visibleSettingsNav` the rail uses, so what you can
 * see here and what you can see in the rail are always the same set — including
 * `campaigns`, which deliberately links out of /settings.
 *
 * Titles and descriptions reuse the nav's existing i18n keys verbatim; no new
 * copy is invented for them.
 */

/** How a status line reads: done, worth attention, or simply informational. */
type Tone = 'ready' | 'attention' | 'neutral';

const DOT: Record<Tone, string> = {
  ready: 'bg-(--positive,#32d583)',
  attention: 'bg-amber-500',
  neutral: 'bg-newTableText',
};

const StatusLine: React.FC<{ tone: Tone; label: string }> = ({ tone, label }) => (
    <span className="flex items-center gap-[7px] text-[12px] text-newTableText">
    <span className={clsx('w-[6px] h-[6px] rounded-full shrink-0', DOT[tone])} aria-hidden="true" />

    {label}
  </span>
);

const SettingsCard: React.FC<{
  item: SettingsNavItem;
  status?: { tone: Tone; label: string };
  t: ReturnType<typeof useT>;
}> = ({ item, status, t }) => (
  <Link
    href={item.href}
    className="group flex items-start gap-[12px] rounded-[12px] border border-newTableBorder bg-newBgColorInner p-[16px] hover:border-[#4F46E5]/50 transition-colors"
  >
    <span className="mt-px w-[18px] h-[18px] shrink-0 flex items-center justify-center text-newTableText group-hover:text-[#4F46E5] transition-colors">
      {item.icon}
    </span>
      <span className="min-w-0 flex flex-col gap-[5px]">
      <span className="text-[14px] font-[600] tracking-[-0.01em] text-textColor">
        {t(item.labelKey, item.labelDefault)}
      </span>
      <span className="text-[13px] leading-[1.5] text-newTableText">
        {t(item.descKey, item.descDefault)}
      </span>
      {status && <StatusLine tone={status.tone} label={status.label} />}
    </span>
  </Link>
);

export const SettingsIndexComponent: React.FC = () => {
  const t = useT();
  const user = useUser();
  const permissions = usePermissions();
  const { isGeneral, billingEnabled } = useVariables();
  // One request for the whole page, and it's already warm from /dashboard.
  const { data: summary } = useDashboardSummary();

  // `showLogout` only narrows the Developers item; on the index there is no
  // onboarding query string, so it matches the layout's default.
  const items = useMemo(
    () =>
      visibleSettingsNav(
        { user, permissions, isGeneral, billingEnabled, showLogout: true },
        t
      ),
    [user, permissions, isGeneral, billingEnabled, t]
  );

  // Only sections the summary actually knows about get a status line. Absence of
  // a line honestly means "nothing to report" rather than "not configured".
  const statusFor = (key: string): { tone: Tone; label: string } | undefined => {
    if (!summary) return undefined;
    switch (key) {
      case 'channels':
        return summary.channelsConnected > 0
          ? {
              tone: 'ready',
              label: t('settings_index_channels_connected', '{{count}} connected', {
                count: summary.channelsConnected,
              }),
            }
          : { tone: 'attention', label: t('settings_index_none_connected', 'None connected') };
      case 'ai':
        return summary.aiProviderActive
          ? { tone: 'ready', label: t('settings_index_active', 'Active') }
          : { tone: 'attention', label: t('settings_index_not_set_up', 'Not set up') };
      case 'content':
        return summary.mediaProviderActive
          ? { tone: 'ready', label: t('settings_index_active', 'Active') }
          : { tone: 'attention', label: t('settings_index_not_set_up', 'Not set up') };
      case 'storage':
        // Local storage is a working configuration, not a gap — never flag it.
        return summary.storageProviderActive
          ? { tone: 'ready', label: t('settings_index_cloud_storage', 'Cloud provider active') }
          : { tone: 'neutral', label: t('settings_index_local_storage', 'Local storage') };
      case 'team':
        return summary.teamMembers > 1
          ? {
              tone: 'ready',
              label: t('settings_index_team_members', '{{count}} members', {
                count: summary.teamMembers,
              }),
            }
          : { tone: 'neutral', label: t('settings_index_team_solo', 'Just you') };
      default:
        return undefined;
    }
  };

  // Sectionless items lead, unlabelled — exactly how the rail orders them. The
  // labelled groups follow in SETTINGS_SECTION_ORDER.
  const ungrouped = items.filter((i) => !i.section);
  const groups = SETTINGS_SECTION_ORDER.map((section) => ({
    section,
    items: items.filter((i) => i.section === section),
  })).filter((g) => g.items.length > 0);

  const grid = (list: SettingsNavItem[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[10px]">
      {list.map((item) => (
        <SettingsCard key={item.key} item={item} status={statusFor(item.key)} t={t} />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-[24px] max-w-[1180px]">
      <div className="flex flex-col gap-[6px]">
        <div className="flex items-center gap-[10px]">
          <div className="w-[28px] h-[28px] rounded-[8px] bg-[#4F46E5] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <h1 className="text-[26px] mobile:text-[22px] font-[700] tracking-[-0.02em] text-textColor">
            {t('settings', 'Settings')}
          </h1>
        </div>
        <p className="text-[13px] text-newTableText]">
          {t(
            'settings_index_description',
            'Connect your channels, bring your own AI and storage, and set how your workspace runs.'
          )}
        </p>
      </div>

      {ungrouped.length > 0 && grid(ungrouped)}

      {groups.map((group) => (
        <section key={group.section} className="flex flex-col gap-[12px]">
          <h2 className="text-[11px] font-[600] uppercase tracking-[0.14em] text-[#4F46E5]">
            {t(
              `settings_section_${group.section.toLowerCase()}`,
              group.section
            )}
          </h2>
          {grid(group.items)}
        </section>
      ))}
    </div>
  );
};
