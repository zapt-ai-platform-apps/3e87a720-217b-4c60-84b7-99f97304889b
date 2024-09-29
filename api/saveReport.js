import { reports } from '../drizzle/schema.js';
import { authenticateUser } from "./_apiUtils.js"
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const user = await authenticateUser(req);

    const { originalText, what_happened, when_happened, who_involved, outcome, next_steps } = req.body;

    if (!originalText || !what_happened || !when_happened || !who_involved || !outcome || !next_steps) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const sql = neon(process.env.NEON_DB_URL);
    const db = drizzle(sql);

    const [newReport] = await db.insert(reports).values({ 
      userId: user.id,
      originalText, 
      whatHappened: what_happened,
      whenHappened: when_happened,
      whoInvolved: who_involved,
      outcome,
      nextSteps: next_steps
    }).returning();

    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error saving report:', error);
    if (error.message.includes('Authorization') || error.message.includes('token')) {
      res.status(401).json({ error: 'Authentication failed' });
    } else {
      res.status(500).json({ error: 'Error saving report' });
    }
  }
}