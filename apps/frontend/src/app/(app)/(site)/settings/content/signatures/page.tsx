'use client';

import { useUser } from '@validpost/frontend/components/layout/user.context';
import { SettingsGate } from '@validpost/frontend/components/settings/settings-gate';
import { SignaturesComponent } from '@validpost/frontend/components/settings/signatures.component';

export default function Page() {
  const user = useUser();
  return (
    <SettingsGate allow={user ? user.tier?.current !== 'STARTER' : undefined}>
      <SignaturesComponent />
    </SettingsGate>
  );
}
