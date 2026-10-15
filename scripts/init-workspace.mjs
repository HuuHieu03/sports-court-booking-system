#!/usr/bin/env node

/**
 * scripts/init-workspace.mjs
 *
 * Bootstraps the local private developer workspace (`my_workspace/`)
 * from the version-controlled scaffold (`scaffolds/my_workspace/`).
 *
 * Guarantees:
 * - Cross-platform (Windows, macOS, Linux) without shell dependencies.
 * - Idempotent: Never overwrites or deletes existing files in `my_workspace/`.
 * - Privacy-safe: One-way sync from scaffold to workspace; never copies private notes back.
 */

import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(__dirname, '..');
const scaffoldDir = join(rootDir, 'scaffolds', 'my_workspace');
const targetDir = join(rootDir, 'my_workspace');

console.log('------------------------------------------------------------');
console.log('Personal Developer Workspace Initialization');
console.log('------------------------------------------------------------');
console.log(`Source scaffold: ${scaffoldDir}`);
console.log(`Target workspace: ${targetDir}`);

if (!existsSync(scaffoldDir)) {
  console.error(`\x1b[31m[ERROR]\x1b[0m Scaffold directory not found at: ${scaffoldDir}`);
  process.exit(1);
}

let createdDirs = 0;
let createdFiles = 0;
let skippedFiles = 0;

function syncDirectory(source, destination) {
  if (!existsSync(destination)) {
    mkdirSync(destination, { recursive: true });
    createdDirs++;
  }

  const entries = readdirSync(source);

  for (const entry of entries) {
    const srcPath = join(source, entry);
    const destPath = join(destination, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      syncDirectory(srcPath, destPath);
    } else if (stat.isFile()) {
      const relPath = relative(targetDir, destPath);
      if (existsSync(destPath)) {
        console.log(`  [SKIP] Existing file preserved: my_workspace/${relPath}`);
        skippedFiles++;
      } else {
        copyFileSync(srcPath, destPath);
        console.log(`  \x1b[32m[CREATE]\x1b[0m Initialized: my_workspace/${relPath}`);
        createdFiles++;
      }
    }
  }
}

try {
  syncDirectory(scaffoldDir, targetDir);

  console.log('------------------------------------------------------------');
  console.log(`Workspace initialization summary:`);
  console.log(`  Directories created: ${createdDirs}`);
  console.log(`  Files created:       ${createdFiles}`);
  console.log(`  Existing preserved:  ${skippedFiles}`);
  console.log('------------------------------------------------------------');
  console.log('\x1b[32m[SUCCESS]\x1b[0m Local private workspace is ready at ./my_workspace/');
  console.log('Reminder: `my_workspace/` is strictly ignored by Git and will never be pushed.');
} catch (error) {
  console.error('\x1b[31m[ERROR]\x1b[0m Failed to initialize workspace:', error);
  process.exit(1);
}
