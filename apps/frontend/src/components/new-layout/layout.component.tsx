'use client';

import React, { ReactNode, useCallback, useState, useRef, useEffect } from 'react';
import { Logo } from '@validpost/frontend/components/new-layout/logo';
import { Wordmark } from '@validpost/frontend/components/new-layout/wordmark';
import { UserAvatarMenu } from '@validpost/frontend/components/new-layout/user-avatar-menu';
import { Plus_Jakarta_Sans } from 'next/font/google';
const ModeComponent = dynamic(
  () => import('@validpost/frontend/components/layout/mode.component'),
  {
    ssr: false,
  }
);

import clsx from 'clsx';
import dynamic from 'next/dynamic';
import { useFetch } from '@validpost/helpers/utils/custom.fetch';
import { useVariables } from '@validpost/react/helpers/variable.context';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import useSWR, { useSWRConfig } from 'swr';
import { CheckPayment } from '@validpost/frontend/components/layout/check.payment';
import { ToolTip } from '@validpost/frontend/components/layout/top.tip';
import { useT } from '@validpost/react/translation/get.transation.service.client';
import { ShowLinkedinCompany } from '@validpost/frontend/components/launches/helpers/linkedin.component';
import { MediaSettingsLayout } from '@validpost/frontend/components/launches/helpers/media.settings.component';
import { Toaster } from '@validpost/react/toaster/toaster';
import { ShowPostSelector } from '@validpost/frontend/components/post-url-selector/post.url.selector';
import { NewSubscription } from '@validpost/frontend/components/layout/new.subscription';
import { Support } from '@validpost/frontend/components/layout/support';
import { ContinueProvider } from '@validpost/frontend/components/layout/continue.provider';
import { ContextWrapper } from '@validpost/frontend/components/layout/user.context';
import { CopilotProvider } from '@validpost/frontend/components/layout/copilot.provider';
import { MantineWrapper } from '@validpost/react/helpers/mantine.wrapper';
import { AnnouncementBanner } from '@validpost/frontend/components/layout/announcement.banner';
import { Title } from '@validpost/frontend/components/layout/title';
import { TopMenu } from '@validpost/frontend/components/layout/top.menu';
import { ChromeExtensionComponent } from '@validpost/frontend/components/layout/chrome.extension.component';
import NotificationComponent from '@validpost/frontend/components/notifications/notification.component';
import { useUser } from '@validpost/frontend/components/layout/user.context';
import { OrganizationSelector } from '@validpost/frontend/components/layout/organization.selector';
import { StreakComponent } from '@validpost/frontend/components/layout/streak.component';
import { PreConditionComponent } from '@validpost/frontend/components/layout/pre-condition.component';
import { AttachToFeedbackIcon } from '@validpost/frontend/components/new-layout/sentry.feedback.component';
import { FirstBillingComponent } from '@validpost/frontend/components/billing/first.billing.component';
import { TrialTracker } from '@validpost/frontend/components/layout/gtm.component';
import { usePermissions } from '@validpost/frontend/components/layout/use-permissions';
import { BottomTabBar } from '@validpost/frontend/components/new-layout/bottom-tab-bar';
import { useModals } from '@validpost/frontend/components/layout/new-modal';
import { useAddProvider } from '@validpost/frontend/components/launches/add.provider.component';

const CreateEditCampaignModal = dynamic(
  () =>
    import(
      '@validpost/frontend/components/campaigns/index/create-edit-campaign.modal'
    ).then((m) => m.CreateEditCampaignModal),
  { ssr: false }
);

const BulkImport = dynamic(
  () =>
    import('@validpost/frontend/components/composer/bulk/bulk.import').then(
      (m) => m.BulkImport
    ),
  { ssr: false }
);

const jakartaSans = Plus_Jakarta_Sans({
  weight: ['600', '500', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
});

export const LayoutComponent = ({ children }: { children: ReactNode }) => {
  const fetch = useFetch();
  const t = useT();

  const { billingEnabled, isGeneral } = useVariables();

  const searchParams = useSearchParams();
  const load = useCallback(
    async (path: string) => {
      const res = await fetch(path);
      if (!res.ok) {
        throw new Error(`Failed to load ${path}: ${res.status}`);
      }
      return await res.json();
    },
    [fetch]
  );
  const {
    data: user,
    error: userError,
    mutate,
  } = useSWR('/user/self', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
  });

  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';
  const permissions = usePermissions();
  const canCompleteSetup =
    permissions.isSuperAdmin || permissions.isOwner || permissions.isAdmin;
  const setupIncomplete = !!user && !user.setupCompleted;
  const mustSetup = setupIncomplete && permissions.isResolved && canCompleteSetup;

  useEffect(() => {
    if (mustSetup) {
      router.replace('/setup');
    }
  }, [mustSetup, router]);

  if (!user) {
    if (userError) {
      return (
        <div
          className={clsx(
            'min-h-screen flex flex-col gap-[16px] items-center justify-center text-newTextColor',
            jakartaSans.className
          )}
        >
          <div className="text-[14px] text-textItemBlur">
            {t(
              'could_not_load_your_account',
              'We could not load your account. Please try again.'
            )}
          </div>
          <button
            type="button"
            onClick={() => mutate()}
            className="h-[36px] px-[16px] rounded-[8px] border border-newTableBorder hover:bg-boxHover text-[13px] font-[500] transition-colors"
          >
            {t('retry', 'Retry')}
          </button>
        </div>
      );
    }
    return null;
  }
  if (setupIncomplete && !permissions.isLoaded) return null;
  if (mustSetup) return null;

  return (
    <ContextWrapper user={user}>
      <CopilotProvider>
        <MantineWrapper>
          <ToolTip />
          <Toaster />
          <TrialTracker />
          <CheckPayment
            check={searchParams.get('check') || ''}
            providerRef={searchParams.get('subscription_id') || searchParams.get('ref') || undefined}
            mutate={mutate}
          >
            <ShowLinkedinCompany />
            <MediaSettingsLayout />
            <ShowPostSelector />
            <PreConditionComponent />
            <NewSubscription />
            <ContinueProvider />
            <div
              className={clsx(
                'flex flex-col min-h-screen min-w-full text-newTextColor',
                jakartaSans.className
              )}
            >
              {user.tier === 'FREE' && isGeneral && billingEnabled ? (
                <FirstBillingComponent />
              ) : (
                <>
                  <AnnouncementBanner />
                  <div className="flex-1 flex">
                    <Support />
                    <div className="mobile:hidden flex flex-col bg-newBgColorInner w-[84px] rounded-l-[12px] border-r border-newTableBorder">
                      <div
                        id="left-menu"
                        className={clsx(
                          'fixed h-full w-[84px] inset-s-[17px] flex flex-1 top-0'
                        )}
                      >
                        <div className="flex flex-col h-full flex-1 py-[16px]">
                          <Link href="/" aria-label={t('home', 'Home')}>
                            <Logo />
                          </Link>
                          <TopMenu />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 bg-newBgLineColor rounded-r-[12px] overflow-hidden flex flex-col gap-px blurMe">
                      <div className="flex bg-newBgColorInner h-[56px] px-[20px] items-center">
                        <div className="text-[20px] font-[600] flex flex-1 items-center gap-[10px] min-w-0">
                          <Link
                            href="/"
                            aria-label={t('home', 'Home')}
                            className="mobile:flex hidden items-center gap-[8px] shrink-0"
                          >
                            <Logo size={34} className="" />
                            {isDashboard && (
                              <Wordmark height={26} className="text-textColor" />
                            )}
                          </Link>
                          {isDashboard && (
                            <Link
                              href="/"
                              aria-label={t('home', 'Home')}
                              className="mobile:hidden flex shrink-0"
                            >
                              <Wordmark height={34} className="text-textColor" />
                            </Link>
                          )}
                          {!isDashboard && <Title />}
                        </div>
                        <div className="flex gap-[16px] text-textItemBlur items-center">
                          <div className="contents mobile:hidden">
                            <div className="flex items-center justify-center w-[36px] h-[36px]">
                              <StreakComponent />
                            </div>
                            <div className="w-px h-[20px] bg-blockSeparator" />
                            <OrganizationSelector />
                            <div className="hover:text-newTextColor flex items-center justify-center w-[36px] h-[36px]">
                              <ModeComponent />
                            </div>
                            <div className="flex items-center justify-center w-[36px] h-[36px] empty:hidden">
                              <ChromeExtensionComponent />
                            </div>
                            <div className="w-px h-[20px] bg-blockSeparator" />
                            <div className="flex items-center justify-center w-[36px] h-[36px] empty:hidden">
                              <AttachToFeedbackIcon />
                            </div>
                          </div>
                          <CreateMenu />
                          <div className="flex items-center justify-center w-[36px] h-[36px]">
                            <NotificationComponent />
                          </div>
                          <div className="flex items-center justify-center w-[36px] h-[36px]">
                            <UserAvatarMenu />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-1 gap-px">{children}</div>
                    </div>
                  </div>
                  <BottomTabBar />
                </>
              )}
            </div>
          </CheckPayment>
        </MantineWrapper>
      </CopilotProvider>
    </ContextWrapper>
  );
};

const createMenuRow =
  'w-full flex items-center gap-[10px] px-[14px] py-[8px] text-[13px] text-textColor hover:bg-boxHover text-start';

const useCreateActions = () => {
  const t = useT();
  const modals = useModals();
  const { mutate } = useSWRConfig();
  const addChannel = useAddProvider(() => mutate('/integrations'), false);

  const openCampaign = useCallback(() => {
    modals.openModal({
      title: t('new_campaign', 'New Campaign'),
      withCloseButton: true,
      children: (
        <CreateEditCampaignModal
          editing={null}
          onDone={() => {
            modals.closeAll();
            mutate('/campaigns');
          }}
        />
      ),
    });
  }, [modals, mutate, t]);

  const openBulkImport = useCallback(() => {
    modals.openModal({
      title: t('bulk_import', 'Bulk Import'),
      withCloseButton: true,
      children: <BulkImport />,
    });
  }, [modals, t]);

  return { openCampaign, openChannel: addChannel, openBulkImport };
};

const CreateMenuItems: React.FC<{ onSelect?: () => void; showChannel: boolean }> = ({
  onSelect,
  showChannel,
}) => {
  const t = useT();
  const { openCampaign, openChannel, openBulkImport } = useCreateActions();
  return (
    <>
      <a
        href="/posts/post"
        role="menuitem"
        onClick={onSelect}
        className={createMenuRow}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        {t('new_post', 'New Post')}
      </a>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onSelect?.();
          openBulkImport();
        }}
        className={createMenuRow}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 3v4a1 1 0 0 0 1 1h4" />
          <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
          <path d="M12 18v-6" />
          <path d="m9 15 3 3 3-3" />
        </svg>
        {t('bulk_import', 'Bulk Import')}
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onSelect?.();
          openCampaign();
        }}
        className={createMenuRow}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m3 11 18-5v12L3 14v-3Z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
        {t('new_campaign', 'New Campaign')}
      </button>
      <a
        href="/media/designer"
        role="menuitem"
        onClick={onSelect}
        className={createMenuRow}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
        </svg>
        {t('new_design', 'New Design')}
      </a>
      {showChannel && (
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onSelect?.();
            openChannel();
          }}
          className={createMenuRow}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          {t('new_channel', 'New Channel')}
        </button>
      )}
    </>
  );
};

const CreateMenu = () => {
  const t = useT();
  const permissions = usePermissions();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup={true}
        aria-label={t('create_new', 'Create new')}
        title={t('create_new', 'Create new')}
        className="flex items-center gap-[4px] h-[32px] px-[8px] rounded-[8px] border border-newTableBorder hover:text-newTextColor hover:bg-boxHover"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute right-0 top-[40px] w-[210px] bg-newBgColorInner border border-newTableBorder rounded-[8px] shadow-lg z-300 py-[4px]"
          role="menu"
        >
          <CreateMenuItems
            onSelect={() => setOpen(false)}
            showChannel={permissions.isAdmin}
          />
        </div>
      )}
    </div>
  );
};
