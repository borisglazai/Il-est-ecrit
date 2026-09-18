import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const learnerStates=sqliteTable('learner_states',{
 userId:text('user_id').primaryKey(),
 payload:text('payload').notNull(),
 revision:integer('revision').notNull(),
 lastWriteId:text('last_write_id').notNull(),
 updatedAt:text('updated_at').notNull()
});
