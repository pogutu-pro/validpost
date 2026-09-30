'use client';

import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { useFetch } from '@validpost/helpers/utils/custom.fetch';
import Link from 'next/link';
import { Button } from '@validpost/react/form/button';
import { Input } from '@validpost/react/form/input';
import { useMemo, useState } from 'react';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { LoginUserDto } from '@validpost/nestjs-libraries/dtos/auth/login.user.dto';
import { OauthProvider } from '@validpost/frontend/components/auth/providers/oauth.provider';
import { useT } from '@validpost/react/translation/get.transation.service.client';
import useSWR from 'swr';
import dynamic from 'next/dynamic';
import { WalletUiProvider } from '@validpost/frontend/components/auth/providers/placeholder/wallet.ui.provider';
import { SsoStatusContext, SsoStatus } from '@validpost/frontend/components/auth/sso-popup';
import { SsoStatusLine } from '@validpost/frontend/components/auth/sso-status';

const WalletProvider = dynamic(
  () => import('@validpost/frontend/components/auth/providers/wallet.provider'),
  {
    ssr: false,
    loading: () => <WalletUiProvider />,
  }
);

export interface AuthProvider {
  provider: string;
  displayName: string;
}

export const useAuthProviders = () => {
  const fetch = useFetch();
  return useSWR<{ providers: AuthProvider[] }>('auth-providers', async () => {
    const res = await fetch('/auth/providers');
    if (!res.ok) throw new Error('failed_to_fetch_auth_providers');
    return res.json();
  });
};

export const providerComponents: Record<string, React.ComponentType> = {
  LOCAL: () => null,
  GENERIC: OauthProvider,
  WALLET: WalletProvider,
};

type Inputs = {
  email: string;
  password: string;
  providerToken: '';
  provider: 'LOCAL';
};
export function Login() {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [notActivated, setNotActivated] = useState(false);
  const [ssoStatus, setSsoStatus] = useState<SsoStatus>({ waiting: false, error: null });
  const { data: providersData, error: providersError } = useAuthProviders();
  // Providers with a real button (LOCAL maps to null) — the "Continue With"
  // label and "OR" divider render only when at least one button will.
  const visibleProviders = (providersData?.providers ?? []).filter(
    (p) => p.provider !== 'LOCAL' && providerComponents[p.provider]
  );
  const resolver = useMemo(() => {
    return classValidatorResolver(LoginUserDto);
  }, []);
  const form = useForm<Inputs>({
    resolver,
    defaultValues: {
      providerToken: '',
      provider: 'LOCAL',
    },
  });
  const fetchData = useFetch();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    setNotActivated(false);
    const login = await fetchData('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        provider: 'LOCAL',
      }),
    });
    if (login.status === 400) {
      const errorMessage = await login.text();
      if (errorMessage === 'User is not activated') {
        setNotActivated(true);
      } else {
        form.setError('email', {
          message: errorMessage,
        });
      }
      setLoading(false);
    } else {
      localStorage.setItem('lastLogin', new Date().toISOString());
    }
  };

  const renderProviders = () => {
    if (visibleProviders.length > 0) {
      return (
        <SsoStatusContext.Provider value={{ status: ssoStatus, setStatus: setSsoStatus }}>
          <div className="gap-[8px] flex flex-wrap">
            {visibleProviders.map((p) => {
              const Component = providerComponents[p.provider];
              return <Component key={p.provider} />;
            })}
          </div>
          <SsoStatusLine status={ssoStatus} />
        </SsoStatusContext.Provider>
      );
    }

    if (providersError) {
      return (
        <div role="alert" className="text-red-500 text-sm mb-[12px]">
          {t('failed_to_fetch_auth_providers', "We couldn't load the other sign-in options. Refresh the page to try again.")}
        </div>
      );
    }

    // No configured OAuth providers (LOCAL maps to no social button) — the
    // email/password form below is the only login method.
    return null;
  };

  return (
    <FormProvider {...form}>
      <form className="flex-1 flex" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col flex-1">
          <div>
            <h1 className="text-[36px] font-[600] tracking-[-0.03em] text-start">
              {t('auth_sign_in_title', 'Welcome back')}
            </h1>
            <p className="mt-[6px] mb-[16px] text-[14px] text-textItemBlur">
              {t('sign_in_subtitle', 'Sign in and get your content moving.')}
            </p>
          </div>
          {visibleProviders.length > 0 && (
            <div className="text-[14px] mt-[32px] mb-[12px]">
              {t('continue_with', 'Continue With')}
            </div>
          )}
          <div className="flex flex-col">
            {renderProviders()}
            {visibleProviders.length > 0 && (
              <div className="h-[20px] mb-[24px] mt-[24px] relative">
                <div className="absolute w-full h-px bg-newTableBorder top-[50%] translate-y-[-50%]" />
                <div
                  className={`absolute z-1 justify-center items-center w-full start-0 top-[-4px] flex`}
                >
                  <div className="px-[16px]">{t('or', 'OR')}</div>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-[12px]">
              <div className="text-textColor">
                <Input
                  label="Email"
                  translationKey="label_email"
                  {...form.register('email')}
                  type="email"
                  placeholder={t('email_address', 'Email Address')}
                />
                <Input
                  label="Password"
                  translationKey="label_password"
                  {...form.register('password')}
                  autoComplete="off"
                  type="password"
                  placeholder={t('label_password', 'Password')}
                />
              </div>
              {notActivated && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-[10px] p-4 mb-4">
                  <p className="text-amber-400 text-sm mb-2">
                    {t(
                      'account_not_activated',
                      'Your account is not activated yet. Please check your email for the activation link.'
                    )}
                  </p>
                  <Link
                    href="/auth/activate"
                    className="text-amber-400 underline hover:font-bold text-sm"
                  >
                    {t('resend_activation_email', 'Resend Activation Email')}
                  </Link>
                </div>
              )}
              <div className="text-center mt-6">
                <div className="w-full flex">
                  <Button
                    type="submit"
                    className="vp-clay flex-1 h-[52px]! border-0"
                    loading={loading}
                  >
                    {t('sign_in_1', 'Sign in')}
                  </Button>
                </div>
                <p className="mt-4 text-sm">
                  {t('don_t_have_an_account', "Don't Have An Account?")}&nbsp;
                  <Link
                    href="/auth"
                    className="underline cursor-pointer text-btnPrimaryAccent hover:text-textColor font-medium"
                  >
                    {t('sign_up', 'Sign Up')}
                  </Link>
                </p>
                <p className="mt-4 text-sm">
                  <Link
                    href="/auth/forgot"
                    className="underline cursor-pointer text-btnPrimaryAccent hover:text-textColor"
                  >
                    {t('forgot_password', 'Forgot password')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
