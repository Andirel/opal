import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const rooms=sqliteTable('rooms',{code:text('code').primaryKey(),state:text('state').notNull(),host:text('host').notNull(),guest:text('guest'),orders0:text('orders0'),orders1:text('orders1'),version:integer('version').notNull().default(0),expires:integer('expires').notNull()});
