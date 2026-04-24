import { describe, expect, it } from 'vitest';
import { greet } from './greet.js';

describe('greet', () => {
  it('greets a formatted user', () => {
    const user = { id: '1', name: 'Ada Lovelace', email: 'ada@example.com' };
    expect(greet(user)).toBe('Hello, Ada Lovelace <ada@example.com>');
  });
});
