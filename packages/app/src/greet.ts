import { format_user, type User } from '@repo/core';

export function greet(user: User): string {
  return `Hello, ${format_user(user)}`;
}
