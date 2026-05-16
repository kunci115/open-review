import express from 'express';
import { handlePullRequest } from './reviewer';
import { createServer } from 'http';

const app = express();
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// GitHub webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    const event = req.headers['x-github-event'] as string;
    const payload = req.body;

    if (!event || !payload) {
      res.status(400).json({ error: 'Missing event or payload' });
      return;
    }

    // Only handle PR events
    if (event === 'pull_request' && 
        ['opened', 'synchronize', 'reopened'].includes(payload.action)) {
      // Acknowledge quickly, review async
      res.status(200).json({ message: 'Review started' });
      handlePullRequest(payload).catch(err => 
        console.error('[OpenReview] Review failed:', err.message)
      );
      return;
    }

    res.status(200).json({ message: `Ignored event: ${event}/${payload.action}` });
  } catch (err: any) {
    console.error('[OpenReview] Webhook error:', err.message);
    res.status(500).json({ error: 'Internal error' });
  }
});

const PORT = parseInt(process.env.PORT || '4000');
createServer(app).listen(PORT, () => {
  console.log(`[OpenReview] Running on :${PORT}`);
  console.log(`[OpenReview] LLM: ${process.env.LLM_PROVIDER || 'openai'} / ${process.env.LLM_MODEL || 'gpt-4o'}`);
});
