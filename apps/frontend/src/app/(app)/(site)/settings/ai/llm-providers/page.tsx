'use client';

import { ProviderSettingsPanel } from '@validpost/frontend/components/settings/shared/kit/provider-settings-panel';
import { aiDescriptor } from '@validpost/frontend/components/settings/shared/kit/descriptors/ai.descriptor';
import { OrgBudgetCard } from '@validpost/frontend/components/settings/ai/org-budget.card';

export default function Page() {
  return (
    <ProviderSettingsPanel descriptor={aiDescriptor}>
      <OrgBudgetCard />
    </ProviderSettingsPanel>
  );
}
