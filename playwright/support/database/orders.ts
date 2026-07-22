import { Insertable } from 'kysely';
import { db, OrdersTable } from './index';
import crypto from 'node:crypto'
import type { OrderDetails } from '../actions/orderLockupActions';

export type InsertOrderData = Insertable<OrdersTable>;

export function normalizeValue(value: string) {
  if (!value) return '';

  return value
    .normalize('NFD') // separa acentos
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/\s+/g, '') // remove espaços
    .toLowerCase(); // lowercase
}

export async function insertOrder(order: OrderDetails) {

  const data: InsertOrderData = {
        id: crypto.randomUUID(),
        order_number: order.number,
        color: order.color.toLowerCase().replace(' ', '-'),
        wheel_type: order.wheels.replace(' Wheels', '').toLowerCase(),
        customer_name: order.customer.name,
        customer_email: order.customer.email,
        customer_phone: order.customer.phone,
        customer_cpf: order.customer.cpf,
        payment_method: normalizeValue(order.payment),
        total_price: order.total_price,
        status: order.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        optionals: []
      }

  return db.insertInto('orders').values(data).returningAll().executeTakeFirstOrThrow();
}

export async function deleteOrder(orderNumber: string) {
  return db.deleteFrom('orders').where('order_number', '=', orderNumber).execute();
}

export async function cleanAllOrders() {
  return db.deleteFrom('orders').execute();
}
