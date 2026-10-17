import { readFile } from 'node:fs/promises';

const QUEUE_PATH = 'docs/ISSUE_QUEUE.md';
const START = /<!--\s*ISSUE:START\s+id=([A-Z][A-Z0-9-]*)\s+status=(PROPOSED|READY|BLOCKED)\s*-->([\s\S]*?)<!--\s*ISSUE:END\s*-->/g;
const REQUIRED = [
  'OBJECTIVE', 'CONTEXT', 'SCOPE', 'ALLOWED FILES', 'FORBIDDEN FILES',
  'REQUIREMENTS', 'ACCEPTANCE CRITERIA', 'REQUIRED CHECKS',
  'MANUAL VERIFICATION', 'DEPENDENCIES', 'ARCHITECTURE / DECISIONS',
  'DELIVERABLE',
];

function parseQueue(source) {
  const allStarts = [...source.matchAll(/<!--\s*ISSUE:START\b/g)].length;
  const blocks = [...source.matchAll(START)];
  if (allStarts !== blocks.length) {
    throw new Error('ISSUE:START without a valid status, id or matching ISSUE:END');
  }

  const seen = new Set();
  return blocks.map(([, id, status, raw]) => {
    if (seen.has(id)) throw new Error('Repeated task ID: ' + id);
    seen.add(id);
    const body = raw.trim();
    const heading = body.match(/^# \[([A-Z][A-Z0-9-]*)\]\s+[—-]\s+(.+)$/m);
    if (!heading || heading[1] !== id) {
      throw new Error('Task ' + id + ' requires heading: # [' + id + '] — Title');
    }
    if (status === 'READY') {
      for (const section of REQUIRED) {
        if (!new RegExp('^#{2,3}\\s+' + section + '\\s*$', 'm').test(body)) {
          throw new Error('READY task ' + id + ' is missing section: ' + section);
        }
      }
      if (body.length > 60000) throw new Error('Task body too long: ' + id);
    }
    return { id, status, title: '[' + id + '] ' + heading[2].trim(), body };
  });
}

async function github(path, options = {}) {
  const response = await fetch('https://api.github.com' + path, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers ?? {}),
    },
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error('GitHub API ' + response.status + ': ' + detail);
  }
  return response.json();
}

async function getAllIssues(repo) {
  const items = [];
  for (let page = 1; ; page++) {
    const batch = await github('/repos/' + repo + '/issues?state=all&per_page=100&page=' + page);
    items.push(...batch.filter(issue => !issue.pull_request));
    if (batch.length < 100) return items;
  }
}

async function main() {
  const text = await readFile(QUEUE_PATH, 'utf8');
  const tasks = parseQueue(text);
  const ready = tasks.filter(t => t.status === 'READY');
  console.log('Validated ' + tasks.length + ' entries; ' + ready.length + ' READY.');

  if (process.env.DRY_RUN === 'true') {
    for (const task of ready) console.log('DRY RUN: ' + task.title);
    return;
  }
  if (!ready.length) return;

  const repo = process.env.GITHUB_REPOSITORY;
  if (!/^[^/]+\/[^/]+$/.test(repo ?? '') || !process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_REPOSITORY and GITHUB_TOKEN are required');
  }
  const known = await getAllIssues(repo);
  for (const task of ready) {
    const marker = '<!-- planning-issue-id: ' + task.id + ' -->';
    if (known.some(issue => (issue.body ?? '').includes(marker) || issue.title?.startsWith('[' + task.id + ']'))) {
      console.log('SKIP existing: ' + task.id);
      continue;
    }
    const created = await github('/repos/' + repo + '/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: task.title,
        body: task.body + '\n\n' + marker + '\n' +
          'Fuente: docs/ISSUE_QUEUE.md. Revisar documentación normativa antes de ejecutar.',
      }),
    });
    known.push(created);
    console.log('CREATED ' + task.id + ': ' + created.html_url);
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
