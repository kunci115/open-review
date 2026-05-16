// Diff → AI Prompt + Parse AI Response

export function diffToPrompt(
  diff: string,
  title: string,
  body: string,
  branch: string
): string {
  const MAX_DIFF_CHARS = 18000; // ~4500 tokens
  const truncated = diff.length > MAX_DIFF_CHARS
    ? diff.slice(0, MAX_DIFF_CHARS) + '\n... (diff truncated)'
    : diff;

  return `Review this pull request:

**Title:** ${title}
**Description:** ${body || '(none)'}
**Branch:** ${branch}

\`\`\`diff
${truncated}
\`\`\`

Respond with a JSON array of review findings.`;
}

interface ReviewComment {
  file: string;
  position: number;
  comment: string;
}

export function parseAIReview(aiResponse: string, _diff: string): ReviewComment[] {
  // Try to extract JSON from the response
  let jsonStr = aiResponse.trim();

  // Handle markdown code blocks wrapping the JSON
  const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((c: any) => c.file && c.position && c.comment)
      .map((c: any) => ({
        file: c.file,
        position: Math.max(1, c.position), // ensure positive
        comment: `**${c.severity || 'suggestion'}**: ${c.comment}`,
      }));
  } catch {
    // If JSON parsing fails, post the raw response as a single comment body
    console.warn('[OpenReview] Could not parse AI response as JSON');
    return [];
  }
}
