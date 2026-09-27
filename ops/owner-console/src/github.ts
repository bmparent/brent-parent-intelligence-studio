type Fetcher = typeof fetch;

const candidates = [
  { repository: 'bmparent/brent-parent-intelligence-studio', pull: 68, role: 'owner site' },
  { repository: 'bmparent/brent-parent-intelligence-studio', pull: 66, role: 'site base' },
  { repository: 'bmparent/eidos', pull: 65, role: 'owner backend' },
  { repository: 'bmparent/eidos', pull: 63, role: 'backend base' },
] as const;

async function githubJson(path: string, fetcher: Fetcher) {
  const response = await fetcher(`https://api.github.com${path}`, {
    headers: { accept: 'application/vnd.github+json', 'user-agent': 'EidosWorksOwnerConsole/1.0' },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`github_http_${response.status}`);
  return response.json();
}

/** Public repository metadata only. No GitHub credential or raw log content enters the Worker. */
export async function readGithub(fetcher: Fetcher = fetch, now = new Date()) {
  const observedAt = now.toISOString();
  const pulls = await Promise.allSettled(candidates.map(async candidate => {
    const value = await githubJson(`/repos/${candidate.repository}/pulls/${candidate.pull}`, fetcher);
    return {
      repository: candidate.repository,
      number: candidate.pull,
      role: candidate.role,
      title: String(value.title || '').slice(0, 180),
      state: value.state === 'open' ? 'open' : value.state === 'closed' ? 'closed' : 'unknown',
      draft: value.draft === true,
      merged: value.merged === true,
      headSha: /^[a-f0-9]{40}$/.test(value.head?.sha || '') ? value.head.sha : null,
      headRef: String(value.head?.ref || '').slice(0, 120),
      updatedAt: value.updated_at || null,
      url: `https://github.com/${candidate.repository}/pull/${candidate.pull}`,
    };
  }));
  const accepted = pulls.filter(x => x.status === 'fulfilled').map(x => x.value);
  const workflowTargets = accepted.filter(x => x.role === 'owner site' || x.role === 'owner backend');
  const runs = await Promise.allSettled(workflowTargets.map(async item => {
    const value = await githubJson(`/repos/${item.repository}/actions/runs?branch=${encodeURIComponent(item.headRef)}&per_page=10`, fetcher);
    const matching = (Array.isArray(value.workflow_runs) ? value.workflow_runs : [])
      .filter((run: Record<string, unknown>) => run.head_sha === item.headSha).slice(0, 5);
    return { repository: item.repository, pull: item.number, headSha: item.headSha,
      runs: matching.map((run: Record<string, unknown>) => ({
        id: run.id, name: String(run.name || '').slice(0, 120),
        status: run.status || 'unknown', conclusion: run.conclusion || null,
        createdAt: run.created_at || null,
        url: run.html_url || null,
      })) };
  }));
  const failures = pulls.filter(x => x.status === 'rejected').length + runs.filter(x => x.status === 'rejected').length;
  return {
    status: accepted.length === 0 ? 'unavailable' : failures ? 'partial' : 'healthy',
    observedAt,
    staleAfter: new Date(now.getTime() + 600000).toISOString(),
    source: 'GitHub public REST API', environment: 'preview',
    errorCode: failures ? 'github_read_partial' : null,
    data: {
      pulls: accepted,
      workflows: runs.filter(x => x.status === 'fulfilled').map(x => x.value),
      requestedPulls: candidates.length,
      releaseGate: 'owner preview and public release acceptance remain separate',
    },
  };
}
