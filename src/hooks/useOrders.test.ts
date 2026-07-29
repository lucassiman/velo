import { vi, describe, it, expect } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {},
}));

import { generateOrderNumber, dbOrderToOrder, DbOrder } from './useOrders';

describe('useOrders utilities', () => {
  describe('generateOrderNumber', () => {
    it('should generate an order number with prefix VLO- and total length of 10', () => {
      const orderNumber = generateOrderNumber();
      expect(orderNumber).toMatch(/^VLO-[A-Z0-9]{6}$/);
      expect(orderNumber.length).toBe(10);
    });

    it('should generate unique order numbers', () => {
      const num1 = generateOrderNumber();
      const num2 = generateOrderNumber();
      expect(num1).not.toBe(num2);
    });
  });

  describe('dbOrderToOrder', () => {
    it('should correctly map database order to frontend order entity with multi-word name', () => {
      const dbOrder: DbOrder = {
        id: 'uuid-123',
        order_number: 'VLO-ABC123',
        color: 'glacier-blue',
        wheel_type: 'sport',
        optionals: ['precision-park', 'flux-capacitor'],
        customer_name: 'Lucas Siman Oliveira',
        customer_email: 'lucas@example.com',
        customer_phone: '31999998888',
        customer_cpf: '123.456.789-00',
        payment_method: 'financiamento',
        total_price: 52500,
        status: 'APROVADO',
        created_at: '2026-07-28T22:00:00.000Z',
        updated_at: '2026-07-28T22:00:00.000Z',
      };

      const result = dbOrderToOrder(dbOrder);

      expect(result.id).toBe('VLO-ABC123');
      expect(result.customer.name).toBe('Lucas');
      expect(result.customer.surname).toBe('Siman Oliveira');
      expect(result.customer.email).toBe('lucas@example.com');
      expect(result.customer.phone).toBe('31999998888');
      expect(result.customer.cpf).toBe('123.456.789-00');
      expect(result.configuration.exteriorColor).toBe('glacier-blue');
      expect(result.configuration.wheelType).toBe('sport');
      expect(result.configuration.optionals).toEqual(['precision-park', 'flux-capacitor']);
      expect(result.totalPrice).toBe(52500);
      expect(result.paymentMethod).toBe('financiamento');
      expect(result.status).toBe('APROVADO');
      expect(result.createdAt).toBe('2026-07-28T22:00:00.000Z');
    });

    it('should handle single name and null optionals safely', () => {
      const dbOrder: DbOrder = {
        id: 'uuid-456',
        order_number: 'VLO-XYZ789',
        color: 'midnight-black',
        wheel_type: 'aero',
        optionals: null,
        customer_name: 'Pedro',
        customer_email: 'pedro@example.com',
        customer_phone: '11988887777',
        customer_cpf: '98765432100',
        payment_method: 'avista',
        total_price: 40000,
        status: 'EM_ANALISE',
        created_at: '2026-07-28T23:00:00.000Z',
        updated_at: '2026-07-28T23:00:00.000Z',
      };

      const result = dbOrderToOrder(dbOrder);

      expect(result.customer.name).toBe('Pedro');
      expect(result.customer.surname).toBe('');
      expect(result.configuration.optionals).toEqual([]);
      expect(result.totalPrice).toBe(40000);
      expect(result.status).toBe('EM_ANALISE');
    });
  });
});
