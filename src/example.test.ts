import { describe, expect, it } from 'vitest';
import { format_user, is_valid_email } from './example.js';

describe('format_user', () => {
  it('formats a user as "name <email>"', () => {
    const user = { id: '1', name: 'Ada Lovelace', email: 'ada@example.com' };
    expect(format_user(user)).toBe('Ada Lovelace <ada@example.com>');
  });
});

describe('is_valid_email', () => {
  it('accepts a well-formed email', () => {
    expect(is_valid_email('user@example.com')).toBe(true);
  });

  it('rejects a malformed email', () => {
    expect(is_valid_email('not-an-email')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(is_valid_email('')).toBe(false);
  });
});
