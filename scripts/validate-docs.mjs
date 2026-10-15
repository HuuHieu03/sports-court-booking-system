#!/usr/bin/env node

/**
 * scripts/validate-docs.mjs
 *
 * Validates YAML Front Matter metadata, schema rules, ID uniqueness,
 * timestamp chronology, and Markdown conventions across documentation.
 *
 * Runs in CI via `npm run docs:validate`.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, join, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(__dirname, '..');

// Allowed enumerations according to documentation/00_governance/metadata-schema.md
const ALLOWED_DOC_TYPES = new Set([
  'governance',
  'product-spec',
  'requirement',
  'architecture-design',
  'adr',
  'api-spec',
  'implementation-plan',
  'worklog',
  'test-plan',
  'meeting-minutes',
  'benchmark-plan',
  'benchmark-report',
  'project-report',
  'research-note',
  'agent-session',
  'review',
  'inbox-note',
  'template',
  'archive',
  'index',
]);

const ALLOWED_STATUSES = new Set([
  'draft',
  'in-review',
  'approved',
  'implemented',
  'superseded',
  'archived',
]);

const ALLOWED_PHASES = new Set(['phase-1', 'phase-2', 'cross-phase']);
const ALLOWED_VISIBILITIES = new Set(['team', 'private']);
const ALLOWED_DECISION_STATUSES = new Set([
  'proposed',
  'accepted',
  'rejected',
  'deprecated',
  'superseded',
]);

// ISO 8601 regex check (accepts date or full timestamp with timezone offset)
const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2}))?$/;

// Collect arguments
const args = process.argv.slice(2);
const scanAll = args.includes('--all');
const scanWorkspace = args.includes('--workspace');

const targetDirs = [];
if (scanWorkspace) {
  if (existsSync(join(rootDir, 'my_workspace'))) {
    targetDirs.push(join(rootDir, 'my_workspace'));
  } else {
    console.log('No local `my_workspace` found to validate.');
    process.exit(0);
  }
} else if (scanAll) {
  targetDirs.push(join(rootDir, 'documentation'));
  targetDirs.push(join(rootDir, 'scaffolds', 'my_workspace'));
  if (existsSync(join(rootDir, 'my_workspace'))) {
    targetDirs.push(join(rootDir, 'my_workspace'));
  }
} else {
  // Default: shared documentation and benchmarks root doc
  targetDirs.push(join(rootDir, 'documentation'));
}

function findMarkdownFiles(dir) {
  const results = [];
  if (!existsSync(dir)) return results;

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...findMarkdownFiles(fullPath));
    } else if (stat.isFile() && entry.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

const allFiles = [];
for (const dir of targetDirs) {
  allFiles.push(...findMarkdownFiles(dir));
}

// Also include benchmarks/README.md if validating shared docs
if (!scanWorkspace && existsSync(join(rootDir, 'benchmarks', 'README.md'))) {
  allFiles.push(join(rootDir, 'benchmarks', 'README.md'));
}

console.log('------------------------------------------------------------');
console.log(`Validating documentation metadata across ${allFiles.length} file(s)...`);
console.log('------------------------------------------------------------');

let totalErrors = 0;
let totalWarnings = 0;
const seenIds = new Map(); // id -> filePath

for (const filePath of allFiles) {
  const relPath = relative(rootDir, filePath).replace(/\\/g, '/');
  const content = readFileSync(filePath, 'utf-8');
  const errors = [];
  const warnings = [];

  // 1. Check for YAML Front Matter
  if (!content.startsWith('---')) {
    errors.push('Missing opening `---` for YAML Front Matter.');
  } else {
    const endMatch = content.indexOf('\n---', 3);
    if (endMatch === -1) {
      errors.push('Missing closing `---` for YAML Front Matter.');
    } else {
      const yamlContent = content.substring(3, endMatch).trim();
      const bodyContent = content.substring(endMatch + 4).trim();

      let meta;
      try {
        meta = parseYaml(yamlContent);
      } catch (e) {
        errors.push(`YAML syntax parsing error: ${e.message}`);
      }

      if (meta && typeof meta === 'object') {
        // Required Fields Validation
        if (!meta.id || typeof meta.id !== 'string') {
          errors.push('Field `id` is required and must be a non-empty string.');
        } else {
          // Check ID uniqueness
          const existingPath = seenIds.get(meta.id);
          if (existingPath) {
            // If one is in scaffolds/my_workspace and the other is the same file in my_workspace, it is an instantiated copy
            const isScaffoldWorkspacePair =
              (existingPath.startsWith('scaffolds/my_workspace/') &&
                relPath === existingPath.replace('scaffolds/my_workspace/', 'my_workspace/')) ||
              (relPath.startsWith('scaffolds/my_workspace/') &&
                existingPath === relPath.replace('scaffolds/my_workspace/', 'my_workspace/'));

            if (!isScaffoldWorkspacePair) {
              errors.push(
                `Duplicate id "${meta.id}". Already used in: ${existingPath}`,
              );
            }
          } else {
            seenIds.set(meta.id, relPath);
          }
        }

        if (!meta.title || typeof meta.title !== 'string') {
          errors.push('Field `title` is required and must be a non-empty string.');
        }

        if (!meta.doc_type || !ALLOWED_DOC_TYPES.has(meta.doc_type)) {
          errors.push(
            `Invalid or missing \`doc_type\`: "${meta.doc_type}". Allowed: ${[...ALLOWED_DOC_TYPES].join(', ')}`,
          );
        }

        if (!meta.status || !ALLOWED_STATUSES.has(meta.status)) {
          errors.push(
            `Invalid or missing \`status\`: "${meta.status}". Allowed: ${[...ALLOWED_STATUSES].join(', ')}`,
          );
        }

        if (!meta.phase || !ALLOWED_PHASES.has(meta.phase)) {
          errors.push(
            `Invalid or missing \`phase\`: "${meta.phase}". Allowed: ${[...ALLOWED_PHASES].join(', ')}`,
          );
        }

        if (!meta.author || typeof meta.author !== 'string') {
          errors.push('Field `author` is required and must be a non-empty string.');
        }

        if (!meta.owner || typeof meta.owner !== 'string') {
          errors.push('Field `owner` is required and must be a non-empty string.');
        }

        // Timestamps
        if (!meta.created_at || !ISO_8601_REGEX.test(String(meta.created_at))) {
          errors.push(
            `Field \`created_at\` must be a valid ISO 8601 string (e.g. 2026-10-15T10:30:00+07:00). Found: "${meta.created_at}"`,
          );
        }

        if (!meta.updated_at || !ISO_8601_REGEX.test(String(meta.updated_at))) {
          errors.push(
            `Field \`updated_at\` must be a valid ISO 8601 string (e.g. 2026-10-15T10:30:00+07:00). Found: "${meta.updated_at}"`,
          );
        }

        if (
          meta.created_at &&
          meta.updated_at &&
          ISO_8601_REGEX.test(String(meta.created_at)) &&
          ISO_8601_REGEX.test(String(meta.updated_at))
        ) {
          const createdTime = new Date(meta.created_at).getTime();
          const updatedTime = new Date(meta.updated_at).getTime();
          if (updatedTime < createdTime) {
            errors.push('Field `updated_at` cannot be earlier than `created_at`.');
          }
        }

        if (!meta.version || typeof meta.version !== 'string') {
          errors.push('Field `version` is required (e.g., "0.1.0").');
        }

        if (!meta.visibility || !ALLOWED_VISIBILITIES.has(meta.visibility)) {
          errors.push(
            `Field \`visibility\` must be either "team" or "private". Found: "${meta.visibility}"`,
          );
        }

        // Check visibility matches location
        if (relPath.startsWith('documentation/') && meta.visibility === 'private') {
          warnings.push('Document under documentation/ marked as private; should be team.');
        }

        if (!Array.isArray(meta.tags) || meta.tags.length === 0) {
          errors.push('Field `tags` must be a non-empty YAML array of strings.');
        }

        if (!meta.summary || typeof meta.summary !== 'string') {
          errors.push('Field `summary` is required and must be a non-empty string.');
        }

        if (!Array.isArray(meta.related_docs)) {
          errors.push('Field `related_docs` must be a YAML array of strings (or empty array `[]`).');
        }

        if (typeof meta.is_template !== 'boolean') {
          errors.push('Field `is_template` must be boolean (true or false).');
        }

        // Specialized validation for ADRs
        if (meta.doc_type === 'adr') {
          if (!meta.decision_status || !ALLOWED_DECISION_STATUSES.has(meta.decision_status)) {
            errors.push(
              `ADRs require \`decision_status\`. Allowed: ${[...ALLOWED_DECISION_STATUSES].join(', ')}. Found: "${meta.decision_status}"`,
            );
          }
        }

        // Check for single H1 header in markdown body (ignoring fenced code blocks)
        const bodyWithoutCodeBlocks = bodyContent.replace(/```[\s\S]*?```/g, '');
        const h1Matches = bodyWithoutCodeBlocks.match(/^#\s+.+$/gm);
        if (!h1Matches || h1Matches.length === 0) {
          warnings.push('Document body does not contain an H1 heading (`# Title`).');
        } else if (h1Matches.length > 1) {
          warnings.push(`Document body contains ${h1Matches.length} H1 headings; recommend exactly 1.`);
        }
      }
    }
  }

  // Print results for this file
  if (errors.length > 0 || warnings.length > 0) {
    console.log(`\n\x1b[36m${relPath}\x1b[0m:`);
    for (const err of errors) {
      console.log(`  \x1b[31m[ERROR]\x1b[0m ${err}`);
      totalErrors++;
    }
    for (const warn of warnings) {
      console.log(`  \x1b[33m[WARN]\x1b[0m  ${warn}`);
      totalWarnings++;
    }
  }
}

console.log('\n------------------------------------------------------------');
console.log(
  `Validation Complete: ${allFiles.length} files scanned | ${totalErrors} error(s) | ${totalWarnings} warning(s)`,
);
console.log('------------------------------------------------------------');

if (totalErrors > 0) {
  console.error('\x1b[31m[FAILED]\x1b[0m Documentation metadata validation failed.');
  process.exit(1);
} else {
  console.log('\x1b[32m[PASSED]\x1b[0m All documentation files conform to governance schema!');
  process.exit(0);
}
