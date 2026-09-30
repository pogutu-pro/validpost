'use client';

import { useUser } from '@validpost/frontend/components/layout/user.context';
import { SettingsGate } from '@validpost/frontend/components/settings/settings-gate';
import { Webhooks } from '@validpost/frontend/components/webhooks/webhooks';

export default function Page() {
  const user = useUser();
  return (
    <SettingsGate allow={user ? !!user.tier?.webhooks : undefined}>
      <Webhooks />
    </SettingsGate>
  );
}
