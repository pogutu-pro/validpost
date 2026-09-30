import { describe, it, expect } from 'vitest';
import { runPaymentsConformance } from '@validpost/provider-kernel';
import defaultModules from '../../index';

describe('google payments conformance', () => {
  it('payments module conforms', () => {
    const payments = defaultModules.find((m) => m.manifest.domain === 'payments');
    expect(payments).toBeDefined();
    runPaymentsConformance(payments!);
  });
});
