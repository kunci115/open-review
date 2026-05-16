// LLM abstraction — supports any OpenAI-compatible API
// Set LLM_BASE_URL, LLM_API_KEY, LLM_MODEL in env

import OpenAI from 'openai';

const baseURL = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '';
const model = process.env.LLM_MODEL || 'gpt-4o';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ baseURL, apiKey });
  }
  return client;
}

export async function callLLM(prompt: string): Promise<string | null> {
  if (!apiKey) {
    console.error('[OpenReview] No LLM_API_KEY set — skipping AI review');
    return null;
  }

  try {
    const res = await getClient().chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 4096,
    });

    return res.choices[0]?.message?.content || null;
  } catch (err: any) {
    console.error(`[OpenReview] LLM call failed:`, err.message);
    return null;
  }
}

const SYSTEM_PROMPT = `You are an expert code reviewer. Analyze the git diff and provide concise, actionable feedback.

Rules:
- Focus on: bugs, security issues, performance problems, broken patterns, missing error handling
- IGNORE: formatting, style, naming preferences, minor typos
- Keep each comment under 3 sentences
- Be specific: reference exact lines and explain WHY it's a problem
- If the code is clean, say so — don't invent issues

Output format (JSON array):
[
  {
    "file": "relative/path/to/file.ts",
    "position": <line number in diff hunk, NOT the absolute line>,
    "severity": "critical|warning|suggestion",
    "comment": "Your review comment here"
  }
]

Position is the 1-indexed line offset WITHIN THE DIFF HUNK, not the absolute file line number. Count from the first line of the diff (including @@ header).`;
