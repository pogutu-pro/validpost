'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import { useFetch } from '@postmill-ai/helpers/utils/custom.fetch';
import { usePermissions } from '@postmill-ai/frontend/components/layout/use-permissions';
import { useT } from '@postmill-ai/react/translation/get.transation.service.client';
import { Button } from '@postmill-ai/react/form/button';
import { SetupStepper } from '@postmill-ai/frontend/components/setup/setup-stepper';
import { StepLlm } from '@postmill-ai/frontend/components/setup/steps/step-llm';
import { StepAiMedia } from '@postmill-ai/frontend/components/setup/steps/step-ai-media';
import { StepChannels } from '@postmill-ai/frontend/components/setup/steps/step-channels';
import { StepContentPacks } from '@postmill-ai/frontend/components/setup/steps/step-content-packs';
import { StepStorage } from '@postmill-ai/frontend/components/setup/steps/step-storage';
import { StepShortlinks } from '@postmill-ai/frontend/components/setup/steps/step-shortlinks';
import { StepVpn } from '@postmill-ai/frontend/components/setup/steps/step-vpn';

const STEP_COMPONENTS: React.FC<{
  onProviderChange?: () => void;
  onActiveChange?: (active: boolean) => void;
}>[] = [
  StepLlm,
  StepAiMedia,
  StepChannels,
  StepContentPacks,
  StepStorage,
  StepShortlinks,
  StepVpn,
];

export function SetupWizard() {
  const t = useT();
  const fetch = useFetch();
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();

  const permissions = usePermissions();
  const canCompleteSetup =
    permissions.isSuperAdmin || permissions.isOwner || permissions.isAdmin;
  useEffect(() => {
    if (permissions.isResolved && !canCompleteSetup) {
      router.replace('/dashboard');
    }
  }, [permissions.isResolved, canCompleteSetup, router]);

  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const saved = window.sessionStorage.getItem('setup:step');
    const n = saved ? parseInt(saved, 10) : 0;
    return Number.isInteger(n) && n >= 0 && n < STEP_COMPONENTS.length ? n : 0;
  });
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [llmActive, setLlmActive] = useState(false);

  const steps = useMemo(
    () => [
      { id: 'llm', label: t('setup_step_llm', 'LLM'), required: true },
      { id: 'ai-media', label: t('setup_step_ai_media', 'AI Media') },
      { id: 'channels', label: t('setup_step_channels', 'Channels') },
      { id: 'content-packs', label: t('setup_step_content_packs', 'Content Packs') },
      { id: 'storage', label: t('setup_step_storage', 'Storage') },
      { id: 'shortlinks', label: t('setup_step_shortlinks', 'Shortlinks') },
      { id: 'vpn', label: t('setup_step_vpn', 'VPN') },
    ],
    [t]
  );

  const { data: summary, mutate: mutateSummary } = useSWR(
    '/dashboard/summary',
    useCallback(async (url: string) => (await fetch(url)).json(), [fetch]),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const handleProviderChange = useCallback(() => {
    mutateSummary();
  }, [mutateSummary]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('setup:step', String(currentStep));
    }
  }, [currentStep]);

  const aiProviderActive = llmActive || !!summary?.aiProviderActive;
  const isLastStep = currentStep === steps.length - 1;
  const canFinish = aiProviderActive;

  const handleNext = useCallback(() => {
    if (currentStep === 0 && !aiProviderActive) return;
    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  }, [currentStep, aiProviderActive, steps.length]);

  const handleSkip = useCallback(() => {
    if (currentStep === 0) return;
    setSkippedSteps((prev) => new Set(prev).add(currentStep));
    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  }, [currentStep, steps.length]);

  const handleBack = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleStepClick = useCallback((index: number) => {
    setCurrentStep(index);
  }, []);

  const finishSetup = useCallback(async () => {
    if (!canFinish) return;
    setFinishing(true);
    setFinishError(null);
    try {
      const res = await fetch('/settings/setup/complete', { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || t('setup_complete_failed', 'Could not complete setup'));
      }
      await globalMutate(
        '/user/self',
        (prev: any) => (prev ? { ...prev, setupCompleted: true } : prev),
        { revalidate: true }
      );
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('setup:step');
      }
      router.replace('/dashboard');
    } catch (err) {
      setFinishing(false);
      setFinishError(
        err instanceof Error ? err.message : t('setup_complete_failed', 'Could not complete setup')
      );
    }
  }, [canFinish, fetch, globalMutate, router, t]);

  const ActiveStepComponent = STEP_COMPONENTS[currentStep];

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-[24px] pt-[24px] pb-[20px] border-b border-newBorder">
        <div className="flex items-center gap-[10px] mb-[10px]">
          <div className="w-[6px] h-[6px] rounded-full bg-btnPrimary" />
          <span className="text-[11px] font-[600] uppercase tracking-[0.08em] text-btnPrimaryAccent">
            {t('setup_badge', 'Workspace Setup')}
          </span>
        </div>
        <h1 className="text-[24px] font-[700] text-btnPrimary tracking-[-0.01em]">
          {t('setup_title', "Let's get your content moving")}
        </h1>
        <p className="text-[13px] text-newTableText mt-[8px] max-w-[720px] leading-[1.6]">
          {t(
            'setup_intro',
            'A quick one-time setup to get ValidPost ready. Only the'
          )}{' '}
          <span className="text-textColor font-[600]">
            {t('setup_step_llm', 'LLM')}
          </span>{' '}
          {t(
            'setup_intro_2',
            'step is required — connect an AI provider to continue. Everything else is optional: skip any step and change it later in Settings.'
          )}
        </p>
      </div>

      <SetupStepper
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
        skippedSteps={skippedSteps}
        onStepClick={handleStepClick}
      />

      <div className="flex-1 min-h-0 overflow-hidden">
        <ActiveStepComponent
          onProviderChange={handleProviderChange}
          onActiveChange={setLlmActive}
        />
      </div>

      {finishError && (
        <div className="shrink-0 px-[24px] py-[10px] bg-red-500/10 border-t border-red-500/20 text-red-500 text-[13px] flex items-center gap-[8px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {finishError}
        </div>
      )}

      <div className="shrink-0 h-[72px] px-[24px] border-t border-newBorder flex items-center justify-between bg-primary">
        <Button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="bg-transparent! border border-newTableBorder text-textColor"
        >
          {t('back', 'Back')}
        </Button>

        <div className="flex items-center gap-[12px]">
          {currentStep !== 0 && !isLastStep && (
            <Button
              type="button"
              onClick={handleSkip}
              className="bg-transparent! border border-newTableBorder text-textColor"
            >
              {t('skip', 'Skip')}
            </Button>
          )}

          {canFinish && (
            <Button
              type="button"
              onClick={finishSetup}
              disabled={finishing}
              className="vp-clay"
            >
              {finishing
                ? t('finishing', 'Finishing...')
                : t('finish_setup', 'Finish setup')}
            </Button>
          )}

          {!isLastStep && (
            <Button
              type="button"
              onClick={handleNext}
              disabled={currentStep === 0 && !aiProviderActive}
              className="vp-clay"
            >
              {t('next', 'Next')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
