import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { RegisterAfter } from '@validpost/frontend/components/auth/register';
import { useFetch } from '@validpost/helpers/utils/custom.fetch';

// The register page must re-prompt for an email when the OAuth provider
// returned none (emailRequired from /auth/oauth/:provider/exists — e.g. an
// OIDC provider that withheld the address) instead of minting a synthetic one.

vi.mock('@validpost/react/translation/get.transation.service.client', () => ({
  useT: () => (_key: string, fallback: string) => fallback,
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@validpost/helpers/utils/custom.fetch', () => ({
  useFetch: vi.fn(),
}));

vi.mock('@validpost/react/helpers/variable.context', () => ({
  useVariables: () => ({
    isGeneral: true,
    genericOauth: false,
    neynarClientId: '',
    billingEnabled: false,
    oauthLogoUrl: '',
    oauthDisplayName: '',
  }),
}));

vi.mock('@validpost/helpers/utils/use.fire.events', () => ({
  useFireEvents: () => vi.fn(),
}));

vi.mock('@validpost/react/helpers/use.track', () => ({
  useTrack: () => vi.fn().mockResolvedValue(undefined),
}));

vi.mock('react-use-cookie', () => ({
  default: () => ['', vi.fn()],
}));

// Plain DTO stand-ins: the real ones pull @prisma/client into jsdom.
vi.mock('@validpost/nestjs-libraries/dtos/auth/create.org.user.dto', () => ({
  CreateOrgUserDto: class CreateOrgUserDto {},
}));

// Pass-through resolver: class-validator's forbidUnknownValues rejects the
// undecorated DTO stand-in above, and DTO validation is covered backend-side.
vi.mock('@hookform/resolvers/class-validator', () => ({
  classValidatorResolver: () => async (values: any) => ({ values, errors: {} }),
}));

// No social buttons under test here — render sentinels for every mapped one.
vi.mock('@validpost/frontend/components/auth/providers/oauth.provider', () => ({
  OauthProvider: () => <div data-testid="oauth-provider" />,
}));
vi.mock('@validpost/frontend/components/auth/providers/wallet.provider', () => ({
  default: () => <div data-testid="wallet-provider" />,
}));

const mockedUseFetch = useFetch as Mock;

function mockFetch(registerResponse?: any) {
  const fetchMock = vi.fn(async (url: string) => {
    if (url === '/auth/providers') {
      return { ok: true, json: async () => ({ providers: [] }) };
    }
    if (url === '/auth/register') {
      return (
        registerResponse ?? {
          status: 200,
          headers: { get: () => null },
          text: async () => '',
        }
      );
    }
    return { ok: true, json: async () => ({}), text: async () => '' };
  });
  mockedUseFetch.mockReturnValue(fetchMock);
  return fetchMock;
}

function renderWithFreshSWR(ui: React.ReactElement) {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {ui}
    </SWRConfig>
  );
}

describe('RegisterAfter email re-prompt (provider returned no email)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hides the email input for a provider registration without emailRequired', async () => {
    const fetchMock = mockFetch();

    renderWithFreshSWR(<RegisterAfter token="provider-token-1" provider="GENERIC" />);
    await act(async () => {});

    expect(screen.queryByPlaceholderText('Email Address')).toBeNull();
    expect(screen.queryByPlaceholderText('Password')).toBeNull();
    expect(screen.getByPlaceholderText('Company')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith('/auth/providers');
  });

  it('shows the email input alongside Company when emailRequired is set', async () => {
    mockFetch();

    renderWithFreshSWR(
      <RegisterAfter token="provider-token-1" provider="GENERIC" emailRequired />
    );
    await act(async () => {});

    expect(screen.getByPlaceholderText('Email Address')).toBeTruthy();
    expect(screen.getByPlaceholderText('Company')).toBeTruthy();
    expect(screen.queryByPlaceholderText('Password')).toBeNull();
  });

  it('sends the re-prompted email in the /auth/register POST', async () => {
    const fetchMock = mockFetch();

    const { container } = renderWithFreshSWR(
      <RegisterAfter token="provider-token-1" provider="GENERIC" emailRequired />
    );
    await act(async () => {});

    fireEvent.change(screen.getByPlaceholderText('Email Address'), {
      target: { value: 'prompted@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Company'), {
      target: { value: 'Acme Inc' },
    });
    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        '/auth/register',
        expect.objectContaining({ method: 'POST' })
      )
    );

    const [, init] = fetchMock.mock.calls.find(
      ([url]) => url === '/auth/register'
    )!;
    expect(JSON.parse(init.body)).toEqual(
      expect.objectContaining({
        email: 'prompted@example.com',
        company: 'Acme Inc',
        providerToken: 'provider-token-1',
        provider: 'GENERIC',
      })
    );
  });
});
