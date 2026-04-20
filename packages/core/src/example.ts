/**
 * Example module. Replace with your actual code.
 * Demonstrates functional/procedural style: named exports, no classes, plain data.
 */

export type User = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
};

export function format_user(user: User): string {
  return `${user.name} <${user.email}>`;
}

export function is_valid_email(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
