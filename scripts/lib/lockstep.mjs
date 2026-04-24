/**
 * Lockstep file enumeration — single source of truth for "every file whose
 * version must match the root's". Used by scripts/bump-version.mjs (backend
 * for the /version skill) and available for future gates (publish, dep
 * checks) to import.
 *
 * The set is discovered, not hardcoded, so it grows with the workspace:
 *   - root package.json
 *   - every packages/*\/package.json (readdir)
 *   - every packages/*\/src/version.ts that contains the literal line
 *       export const version = '<SEMVER>';
 *     Packages opt in by creating the file; packages without one are skipped.
 *
 * Rewrites are idempotent and key on that exact literal line. A version.ts
 * file that exists but does not match the literal pattern fails loudly — the
 * file declares an intent to participate, so silently skipping it would hide
 * skew.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = join(__dirname, '..', '..');
const PACKAGES_DIR = join(REPO_ROOT, 'packages');

export const VERSION_LITERAL_RE = /export\s+const\s+version\s*=\s*['"]([^'"]+)['"]\s*;?/;

/**
 * Enumerate every file in the lockstep set.
 *
 * Returns an array of { path, kind, rel } entries. `kind` is one of:
 *   'root_pkg'    — the repo-root package.json
 *   'package_pkg' — a packages/<name>/package.json
 *   'version_ts'  — a packages/<name>/src/version.ts with the literal
 *
 * Stable order: root first, then packages in directory-name order, with each
 * package's package.json immediately followed by its version.ts (if present).
 */
export async function enumerate_lockstep() {
  const files = [];
  const root_pkg = join(REPO_ROOT, 'package.json');
  files.push({ path: root_pkg, kind: 'root_pkg', rel: relative(REPO_ROOT, root_pkg) });

  if (!existsSync(PACKAGES_DIR)) return files;

  const entries = await readdir(PACKAGES_DIR, { withFileTypes: true });
  const pkg_dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();

  for (const name of pkg_dirs) {
    const pkg_path = join(PACKAGES_DIR, name, 'package.json');
    if (existsSync(pkg_path)) {
      files.push({ path: pkg_path, kind: 'package_pkg', rel: relative(REPO_ROOT, pkg_path) });
    }
    const version_ts_path = join(PACKAGES_DIR, name, 'src', 'version.ts');
    if (existsSync(version_ts_path)) {
      files.push({ path: version_ts_path, kind: 'version_ts', rel: relative(REPO_ROOT, version_ts_path) });
    }
  }
  return files;
}

export async function read_current_version(file) {
  if (file.kind === 'root_pkg' || file.kind === 'package_pkg') {
    const pkg = JSON.parse(await readFile(file.path, 'utf8'));
    if (typeof pkg.version !== 'string' || pkg.version.length === 0) {
      throw new Error(`${file.rel} is missing a \`version\` field`);
    }
    return pkg.version;
  }
  const text = await readFile(file.path, 'utf8');
  const m = text.match(VERSION_LITERAL_RE);
  if (!m) {
    throw new Error(
      `${file.rel} does not contain a matching \`export const version = '<SEMVER>';\` line`,
    );
  }
  return m[1];
}

export async function write_new_version(file, new_version) {
  if (file.kind === 'root_pkg' || file.kind === 'package_pkg') {
    const text = await readFile(file.path, 'utf8');
    const pkg = JSON.parse(text);
    if (pkg.version === new_version) return false;
    pkg.version = new_version;
    const indent = detect_indent(text);
    const trailing = text.endsWith('\n') ? '\n' : '';
    await writeFile(file.path, `${JSON.stringify(pkg, null, indent)}${trailing}`);
    return true;
  }
  const text = await readFile(file.path, 'utf8');
  if (!VERSION_LITERAL_RE.test(text)) {
    throw new Error(
      `${file.rel} does not contain a matching \`export const version = '<SEMVER>';\` line`,
    );
  }
  const updated = text.replace(VERSION_LITERAL_RE, (match, current) => {
    if (current === new_version) return match;
    return match
      .replace(`'${current}'`, `'${new_version}'`)
      .replace(`"${current}"`, `"${new_version}"`);
  });
  if (updated === text) return false;
  await writeFile(file.path, updated);
  return true;
}

function detect_indent(text) {
  const m = text.match(/^([ \t]+)"/m);
  return m ? m[1] : 2;
}

export function bump_semver(current, type) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(current);
  if (!m) throw new Error(`unparseable semver: ${current}`);
  const [, ma, mi, pa] = m;
  const major = Number(ma);
  const minor = Number(mi);
  const patch = Number(pa);
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  if (type === 'patch') return `${major}.${minor}.${patch + 1}`;
  throw new Error(`unknown bump type: ${type}`);
}
