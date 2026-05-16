import { Octokit } from 'octokit';
import { callLLM } from './llm';
import { diffToPrompt, parseAIReview } from './prompt';

const github = new Octokit({ 
  auth: process.env.GITHUB_TOKEN 
});

interface PROutput {
  repository: {
    owner: { login: string };
    name: string;
  };
  number: number;
  pull_request: {
    head: { sha: string; ref: string };
    base: { sha: string; ref: string };
    title: string;
    body: string | null;
    html_url: string;
  };
}

export async function handlePullRequest(payload: PROutput) {
  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const prNumber = payload.number;
  const sha = payload.pull_request.head.sha;

  console.log(`[OpenReview] Reviewing ${owner}/${repo}#${prNumber}`);

  // 1. Get the diff
  const { data: diffData } = await github.rest.pulls.get({
    owner, repo, pull_number: prNumber, mediaType: { format: 'diff' },
  });

  const diff = diffData as unknown as string;
  if (!diff || diff.length < 10) {
    console.log(`[OpenReview] PR #${prNumber}: empty diff, skipping`);
    return;
  }

  // 2. Build prompt & call AI
  const prompt = diffToPrompt(
    diff,
    payload.pull_request.title,
    payload.pull_request.body || '',
    payload.pull_request.head.ref
  );

  const aiResponse = await callLLM(prompt);
  if (!aiResponse) return;

  // 3. Parse AI response into review comments
  const comments = parseAIReview(aiResponse, diff);
  if (comments.length === 0) return;

  // 4. Post review
  try {
    await github.rest.pulls.createReview({
      owner, repo, pull_number: prNumber,
      commit_id: sha,
      event: 'COMMENT',
      comments: comments.map(c => ({
        path: c.file,
        position: c.position,
        body: c.comment,
      })),
      body: `🤖 **OpenReview** — AI Code Review\n\n${comments.length} finding(s) reported.\n\n---\n*Powered by ${process.env.LLM_MODEL || 'AI'} • Self-hosted • MIT*`,
    });
    console.log(`[OpenReview] ✅ Posted ${comments.length} comment(s) on #${prNumber}`);
  } catch (err: any) {
    console.error(`[OpenReview] ❌ Failed to post review:`, err.message);
  }
}
