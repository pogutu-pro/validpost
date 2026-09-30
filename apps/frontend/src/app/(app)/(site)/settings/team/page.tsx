'use client';

import { useUser } from '@validpost/frontend/components/layout/user.context';
import { useVariables } from '@validpost/react/helpers/variable.context';
import { TeamsComponent } from '@validpost/frontend/components/settings/teams.component';
import { SettingsGate } from '@validpost/frontend/components/settings/settings-gate';

export default function Page() {
  const user = useUser();
  const { isGeneral } = useVariables();
  return (
    <SettingsGate allow={user ? (user.tier?.team_members ?? 0) > 1 && isGeneral : undefined}>
      <TeamsComponent />
    </SettingsGate>
  );
}
