import { Page, expect } from '@playwright/test'

export function createCheckoutActions(page: Page) {
  return {
    async goToCheckout() {
      await page.getByRole('button', { name: 'Monte o Seu' }).click()
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    },

    async expectOrderSummaryTotal(price: string) {
      const priceElement = page.getByTestId('summary-total-price')
      await expect(priceElement).toBeVisible()
      await expect(priceElement).toHaveText(price)
    },

    async expectOrderSummaryDescriptionWithOptionals() {
      await expect(page.locator('ul')).toMatchAriaSnapshot(`
        - list:
          - listitem: Cor Glacier Blue
          - listitem: Interior carbon black
          - listitem: Rodas aero Wheels
          - listitem: Flux Capacitor + R$ 5.000,00
          - listitem: Precision Park + R$ 5.500,00
          
        `)
    }
  }
}
