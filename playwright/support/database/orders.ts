import { Insertable } from 'kysely';
import { db, OrdersTable } from './index';

export type InsertOrderData = Insertable<OrdersTable>;

export async function insertOrder(data: InsertOrderData) {
  return db.insertInto('orders').values(data).returningAll().executeTakeFirstOrThrow();
}

export async function deleteOrder(orderNumber: string) {
  return db.deleteFrom('orders').where('order_number', '=', orderNumber).execute();
}

export async function cleanAllOrders() {
  return db.deleteFrom('orders').execute();
}
