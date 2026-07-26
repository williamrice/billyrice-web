import { describe, expect, it } from 'vitest';

import { SITE_URL } from '../../lib/site';
import { absoluteUrl } from '../../lib/utils/urls';

describe('site URL configuration', () => {
  it('uses billyrice.com as the canonical origin', () => {
    expect(SITE_URL).toBe('https://billyrice.com');
  });

  it('builds absolute URLs for public paths', () => {
    expect(absoluteUrl('/resume')).toBe('https://billyrice.com/resume');
  });
});
