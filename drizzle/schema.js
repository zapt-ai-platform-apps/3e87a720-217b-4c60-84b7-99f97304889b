import { pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  originalText: text('original_text').notNull(),
  whatHappened: text('what_happened').notNull(),
  whenHappened: text('when_happened').notNull(),
  whoInvolved: text('who_involved').notNull(),
  outcome: text('outcome').notNull(),
  nextSteps: text('next_steps').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});