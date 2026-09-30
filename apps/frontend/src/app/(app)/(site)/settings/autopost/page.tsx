'use client';

import { useUser } from '@validpost/frontend/components/layout/user.context';
import { SettingsGate } from '@validpost/frontend/components/settings/settings-gate';
import { Autopost } from '@validpost/frontend/components/autopost/autopost';

export default function Page() {
  const user = useUser();
  return (
    <SettingsGate allow={user ? !!user.tier : undefined}>
      <Autopost />
    </SettingsGate>
  );
}
