import { getT } from '@postmill-ai/react/translation/get.translation.service.backend';

export const dynamic = 'force-dynamic';
import { ReactNode } from 'react';
import loadDynamic from 'next/dynamic';
import { Logo } from '@postmill-ai/frontend/components/new-layout/logo';
import { Wordmark } from '@postmill-ai/frontend/components/new-layout/wordmark';
import { StatusBadge, PostStatus } from '@postmill-ai/frontend/components/ui/status-badge';
const ReturnUrlComponent = loadDynamic(() => import('./return.url.component'));
const SignupPlanComponent = loadDynamic(() => import('./signup.plan.component'));

const features = [
  {
    key: 'auth_feature_channels',
    text: 'Every channel you publish on, one composer',
  },
  {
    key: 'auth_feature_ai_content',
    text: 'AI writer & design studio — on your own keys',
  },
  {
    key: 'auth_feature_calendar',
    text: 'Visual calendar, timezone-aware scheduling',
  },
  {
    key: 'auth_feature_inbox',
    text: 'Daily analytics snapshots & a prioritized reply inbox',
  },
];

// Decorative product preview (aria-hidden) — illustrates the post lifecycle,
// carries no data.
const lifecycle: { status: PostStatus; widths: [string, string] }[] = [
  { status: 'draft', widths: ['w-[82%]', 'w-[54%]'] },
  { status: 'scheduled', widths: ['w-[68%]', 'w-[76%]'] },
  { status: 'published', widths: ['w-[90%]', 'w-[40%]'] },
];

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getT();

  // Auth is always dark: the `dark` class re-scopes the theme tokens for this
  // subtree, so the panels use tokens instead of hard-coded hex.
  return (
    <div className="dark bg-newBgColor flex flex-1 p-[12px] mobile:p-0 gap-[12px] min-h-screen w-screen text-textColor">
      <ReturnUrlComponent />
      <SignupPlanComponent />
      <main className="flex flex-col py-[40px] mobile:py-[28px] px-[20px] flex-1 lg:w-[600px] lg:flex-none rounded-vpLg mobile:rounded-none bg-newBgColorInner relative overflow-hidden">
        <div className="vp-gradient absolute inset-x-0 top-0 h-[4px] lg:hidden" aria-hidden="true" />
        <div className="w-full max-w-[440px] mx-auto justify-center gap-[24px] h-full flex flex-col">
          <div className="flex items-center gap-[10px]">
            <Logo size={32} className="" />
            <Wordmark className="text-textColor" />
          </div>
          <div className="flex">{children}</div>
        </div>
      </main>
      <aside
        className="flex-1 hidden lg:flex flex-col items-center justify-center rounded-vpLg bg-newBgColorInner relative overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(60% 50% at 15% 10%, color-mix(in srgb, var(--vp-purple) 34%, transparent), transparent 70%), radial-gradient(55% 45% at 90% 95%, color-mix(in srgb, var(--vp-orange) 26%, transparent), transparent 70%), radial-gradient(50% 40% at 85% 15%, color-mix(in srgb, var(--vp-pink) 24%, transparent), transparent 70%)',
        }}
      >
        <div className="flex flex-col items-center gap-[36px] max-w-[460px] px-[40px]">
          <h1 className="text-[34px] font-[700] tracking-[-0.03em] text-textColor text-center leading-[1.1]">
            {t('auth_tagline', 'Create it. Schedule it. Watch it land.')}
          </h1>
          <div className="w-full flex flex-col gap-[10px]" aria-hidden="true">
            {lifecycle.map(({ status, widths }, i) => (
              <div
                key={status}
                className="vp-rise flex items-center gap-[14px] rounded-vpLg bg-newBgColorInner/80 border border-newTableBorder shadow-elev2 p-[14px] backdrop-blur-sm"
                style={{ animationDelay: `${i * 90}ms`, marginLeft: `${i * 18}px` }}
              >
                <div className="vp-gradient w-[36px] h-[36px] rounded-[12px] shrink-0 shadow-clay" />
                <div className="flex-1 flex flex-col gap-[7px]">
                  <div className={`h-[8px] rounded-full bg-newTableBorder ${widths[0]}`} />
                  <div className={`h-[8px] rounded-full bg-newTableBorder/60 ${widths[1]}`} />
                </div>
                <StatusBadge status={status} />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-[12px] w-full">
            {features.map((feature) => (
              <div
                key={feature.key}
                className="flex items-center gap-[12px] text-[14px] text-textColor"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0 text-btnPrimary"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" fill="currentColor" />
                  <path
                    d="M8 12l3 3 5-5"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{t(feature.key, feature.text)}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
