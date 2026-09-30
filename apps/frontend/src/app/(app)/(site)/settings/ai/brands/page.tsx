'use client';

import { useUser } from '@validpost/frontend/components/layout/user.context';
import { SettingsGate } from '@validpost/frontend/components/settings/settings-gate';
import { BrandList } from '@validpost/frontend/components/settings/brand/brand-list';

export default function Page() {
  const user = useUser();
  return (
    <SettingsGate allow={user ? !!user.tier?.brand_kits : undefined}>
      <BrandList />
    </SettingsGate>
  );
}
