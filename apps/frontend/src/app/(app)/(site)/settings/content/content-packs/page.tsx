'use client';

import { usePermissions } from '@validpost/frontend/components/layout/use-permissions';
import { ContentPacksTab } from '@validpost/frontend/components/settings/content-packs/content-packs.tab';
import { SettingsGate } from '@validpost/frontend/components/settings/settings-gate';

export default function Page() {
  const permissions = usePermissions();
  return (
    <SettingsGate
      allow={permissions.isResolved ? permissions.hasPermission('media-config', 'manage') : undefined}
    >
      <ContentPacksTab />
    </SettingsGate>
  );
}
