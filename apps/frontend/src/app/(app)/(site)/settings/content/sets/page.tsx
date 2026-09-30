'use client';

import { useUser } from '@validpost/frontend/components/layout/user.context';
import { SettingsGate } from '@validpost/frontend/components/settings/settings-gate';
import { Sets } from '@validpost/frontend/components/sets/sets';

export default function Page() {
  const user = useUser();
  return (
    <SettingsGate allow={user ? !!user.tier : undefined}>
      <Sets />
    </SettingsGate>
  );
}
