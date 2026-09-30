import { describe, it, expect } from 'vitest';
import { LANGUAGE_CODES } from '@validpost/provider-kernel';
import { languages } from '@validpost/react-shared-libraries/translation/i18n.config';

describe('Language code synchronization', () => {
  it('LANGUAGE_CODES matches the UI i18n languages exactly', () => {
    expect(LANGUAGE_CODES).toEqual(languages);
  });
});
