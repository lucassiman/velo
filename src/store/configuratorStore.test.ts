import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockStorage: Record<string, string> = {};
const storageMock = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
};

vi.stubGlobal('localStorage', storageMock);
vi.stubGlobal('window', { localStorage: storageMock });

import {
  calculateTotalPrice,
  calculateInstallment,
  formatPrice,
  useConfiguratorStore,
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

describe('useConfiguratorStore store actions', () => {
  beforeEach(() => {
    useConfiguratorStore.setState({
      configuration: {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: [],
      },
      viewMode: 'exterior',
      orders: [],
      currentUserEmail: null,
    });
  });

  it('should update exterior color and switch viewMode to exterior', () => {
    const store = useConfiguratorStore.getState();
    store.setInteriorColor('deep-blue');
    expect(useConfiguratorStore.getState().viewMode).toBe('interior');

    useConfiguratorStore.getState().setExteriorColor('midnight-black');

    const updatedState = useConfiguratorStore.getState();
    expect(updatedState.configuration.exteriorColor).toBe('midnight-black');
    expect(updatedState.viewMode).toBe('exterior');
  });

  it('should update interior color and switch viewMode to interior', () => {
    useConfiguratorStore.getState().setInteriorColor('deep-blue');

    const updatedState = useConfiguratorStore.getState();
    expect(updatedState.configuration.interiorColor).toBe('deep-blue');
    expect(updatedState.viewMode).toBe('interior');
  });

  it('should toggle optional features on and off', () => {
    const store = useConfiguratorStore.getState();
    expect(store.configuration.optionals).toEqual([]);

    store.toggleOptional('precision-park');
    expect(useConfiguratorStore.getState().configuration.optionals).toEqual(['precision-park']);

    store.toggleOptional('flux-capacitor');
    expect(useConfiguratorStore.getState().configuration.optionals).toEqual(['precision-park', 'flux-capacitor']);

    store.toggleOptional('precision-park');
    expect(useConfiguratorStore.getState().configuration.optionals).toEqual(['flux-capacitor']);
  });

  it('should reset configuration back to defaults', () => {
    const store = useConfiguratorStore.getState();
    store.setExteriorColor('lunar-white');
    store.setWheelType('sport');
    store.toggleOptional('flux-capacitor');

    store.resetConfiguration();

    const resetState = useConfiguratorStore.getState();
    expect(resetState.configuration).toEqual({
      exteriorColor: 'glacier-blue',
      interiorColor: 'carbon-black',
      wheelType: 'aero',
      optionals: [],
    });
  });

  it('should handle login, logout and getUserOrders correctly', () => {
    const store = useConfiguratorStore.getState();

    const mockOrder = {
      id: 'VLO-123456',
      configuration: {
        exteriorColor: 'glacier-blue' as const,
        interiorColor: 'carbon-black' as const,
        wheelType: 'aero' as const,
        optionals: [],
      },
      totalPrice: 40000,
      customer: {
        name: 'Maria',
        surname: 'Silva',
        email: 'maria@example.com',
        phone: '11999999999',
        cpf: '12345678901',
        store: 'SP-01',
      },
      paymentMethod: 'avista' as const,
      status: 'APROVADO' as const,
      createdAt: '2026-07-28T00:00:00.000Z',
    };

    store.addOrder(mockOrder);

    // Unauthenticated user should get empty orders array
    expect(useConfiguratorStore.getState().getUserOrders()).toEqual([]);

    // Login with unregistered email should return false
    const loginFail = useConfiguratorStore.getState().login('invalid@example.com');
    expect(loginFail).toBe(false);
    expect(useConfiguratorStore.getState().currentUserEmail).toBeNull();

    // Login with registered email should return true
    const loginSuccess = useConfiguratorStore.getState().login('maria@example.com');
    expect(loginSuccess).toBe(true);
    expect(useConfiguratorStore.getState().currentUserEmail).toBe('maria@example.com');
    expect(useConfiguratorStore.getState().getUserOrders()).toEqual([mockOrder]);

    // Logout should reset user email and return empty user orders
    useConfiguratorStore.getState().logout();
    expect(useConfiguratorStore.getState().currentUserEmail).toBeNull();
    expect(useConfiguratorStore.getState().getUserOrders()).toEqual([]);
  });
});

