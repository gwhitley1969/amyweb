#!/usr/bin/env node
/**
 * Clinician-approval gate (CLAUDE.md hard constraint 4, BUILD_SPEC §7).
 *
 * Runs in the PRODUCTION deploy job and fails the deploy if any non-draft
 * treatment file has clinicianApproved: false (or missing). Draft files are
 * excluded from the build entirely, so they may remain unapproved.
 *
 * Only the human operator ever sets clinicianApproved: true.
 * `--self-test` proves the gate fires before trusting it.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const treatmentsDir = resolve(root, 'src', 'content', 'treatments');

const APPROVED = /^\s*clinicianApproved:\s*true\s*$/m;
const DRAFT = /^\s*draft:\s*true\s*$/m;

/** Returns a violation string or null for one file's text. */
function checkText(text) {
  if (DRAFT.test(text)) return null; // drafts never build, never publish
  if (!APPROVED.test(text)) {
    return 'non-draft treatment content is not clinician-approved (clinicianApproved must be true, set only by the operator)';
  }
  return null;
}

function runCheck() {
  let files = [];
  try {
    files = readdirSync(treatmentsDir).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  } catch {
    // no treatments directory yet — nothing to gate
  }
  let failed = false;
  for (const file of files) {
    const full = join(treatmentsDir, file);
    const problem = checkText(readFileSync(full, 'utf8'));
    if (problem) {
      failed = true;
      console.error(`  ${relative(root, full).replaceAll('\\', '/')}  ${problem}`);
    }
  }
  if (failed) {
    console.error('\ncheck-approvals FAILED — unapproved treatment content must not reach production.');
    process.exit(1);
  }
  console.log(`check-approvals passed — ${files.length} treatment file(s) checked.`);
}

function runSelfTest() {
  const unapproved = 'title: X\nclinicianApproved: false\ndraft: false\n';
  const missingFlag = 'title: X\ndraft: false\n';
  const draft = 'title: X\nclinicianApproved: false\ndraft: true\n';
  const approved = 'title: X\nclinicianApproved: true\ndraft: false\n';

  let failed = false;
  if (!checkText(unapproved)) {
    console.error('self-test: unapproved non-draft file was NOT rejected');
    failed = true;
  }
  if (!checkText(missingFlag)) {
    console.error('self-test: file missing clinicianApproved was NOT rejected');
    failed = true;
  }
  if (checkText(draft)) {
    console.error('self-test: draft file was wrongly rejected');
    failed = true;
  }
  if (checkText(approved)) {
    console.error('self-test: approved file was wrongly rejected');
    failed = true;
  }
  if (failed) {
    console.error('check-approvals self-test FAILED — the gate itself is broken.');
    process.exit(1);
  }
  console.log('check-approvals self-test passed.');
}

if (process.argv.includes('--self-test')) {
  runSelfTest();
} else {
  runCheck();
}
