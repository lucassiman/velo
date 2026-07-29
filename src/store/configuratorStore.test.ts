import { describe, it, expect } from 'vitest';
import {
  calculateTotalPrice,
  calculateInstallment,
  formatPrice,
  CarConfiguration,
} from './configuratorStore';

describe('configuratorStore pure functions', () => {
  describe('calculateTotalPrice', () => {
    it('should return base price when default options are selected', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: [],
      };

      expect(calculateTotalPrice(config)).toBe(40000);
    });

    it('should add sport wheels price to the total', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: [],
      };

      expect(calculateTotalPrice(config)).toBe(42000);
    });

    it('should add optional features prices to the total', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: ['precision-park', 'flux-capacitor'],
      };

      // 40000 (base) + 5500 (precision-park) + 5000 (flux-capacitor) = 50500
      expect(calculateTotalPrice(config)).toBe(50500);
    });

    it('should calculate total with both sport wheels and optional features', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: ['precision-park', 'flux-capacitor'],
      };

      // 40000 + 2000 + 5500 + 5000 = 52500
      expect(calculateTotalPrice(config)).toBe(52500);
    });

    it('should handle undefined or non-array optionals safely', () => {
      const config = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: undefined as unknown as [],
      } as CarConfiguration;

      expect(calculateTotalPrice(config)).toBe(40000);
    });
  });

  describe('calculateInstallment', () => {
    it('should correctly calculate 12x installment with 2% monthly interest', () => {
      const total = 40000;
      const installment = calculateInstallment(total);

      // Expected calculation: ~3782.38
      expect(installment).toBe(3782.38);
    });

    it('should return 0 when total price is 0', () => {
      expect(calculateInstallment(0)).toBe(0);
    });
  });

  describe('formatPrice', () => {
    it('should format numbers into BRL currency string', () => {
      const formatted = formatPrice(40000);

      // Verify currency code/symbol and value formatting for Brazilian Real
      expect(formatted).toContain('40.000,00');
      expect(formatted).toMatch(/R\$\s?40\.000,00/);
    });

    it('should format zero correctly', () => {
      const formatted = formatPrice(0);
      expect(formatted).toContain('0,00');
    });
  });
});
