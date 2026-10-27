import {integer,pgTable,text} from 'drizzle-orm/pg-core';
export const workspace=pgTable('workspace',{id:text('id').primaryKey(),data:text('data').notNull(),revision:integer('revision').notNull().default(0)});
export const coachCustomer=pgTable('coach_customer',{accountId:text('account_id').primaryKey(),customerId:text('customer_id').notNull().unique()});
