import { Locator, Page, expect } from '@playwright/test'

export function createConfiguratorActions(page: Page) {

  function optionalCheckbox(name: RegExp): Locator {
    return page.getByRole('checkbox', { name })
  }

  return {
    async open() {
      await page.goto('/configure')
    },

    async selectColor(name: string) {
      await page.getByRole('button', { name }).click()
    },

    async selectWheels(name: string | RegExp) {
      await page.getByRole('button', { name }).click()
    },

    async checkOptional(name: RegExp) {
      await optionalCheckbox(name).check()
    },

    async uncheckOptional(name: RegExp) {
      await optionalCheckbox(name).uncheck()
    },

    async finalizeConfiguration() {
      await page.getByRole('button', { name: 'Monte o Seu' }).click()
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    },

    async expectTotalPrice(price: string) {
      const priceElement = page.getByTestId('total-price')
      await expect(priceElement).toBeVisible()
      await expect(priceElement).toHaveText(price)
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
          
        `);
    },

    async expectCarImageSrc(src: RegExp) {
      const carImage = page.locator('img[alt^="Velô Sprint"]')
      await expect(carImage).toHaveAttribute('src', src)
    }
  }
}

