import { Kysely, PostgresDialect } from 'kysely';
import pkg from 'pg';
const { Pool } = pkg;

export interface OrdersTable {
  id: string;
  order_number: string;
  color: string;
  wheel_type: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_cpf: string;
  payment_method: string;
  total_price: string;
  status: string;
  created_at: string;
  updated_at: string;
  optionals: string[];
}

export interface Database {
  orders: OrdersTable;
}

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString,
    }),
  }),
});
