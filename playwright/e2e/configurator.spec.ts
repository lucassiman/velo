import { test, expect } from '../support/fixtures'

test.describe('Configuração do Veículo', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/configure') 
  })

  test('alterar a cor do veículo não deve impactar o preço base', async ({ page }) => {
    const priceElement = page.getByTestId('total-price')
    const car = page.locator('img[alt^="Velô Sprint"]')
    await expect(priceElement).toBeVisible()
    await expect(priceElement).toHaveText('R$ 40.000,00') 

    await page.getByRole('button', { name: 'Midnight Black' }).click()
    await expect(priceElement).toHaveText('R$ 40.000,00')

    await expect(car).toHaveAttribute('src', '/src/assets/midnight-black-aero-wheels.png')
  })

  test('alterar as rodas do veículo deve atualizar o preço de venda', async ({ page }) => {
    const priceElement = page.getByTestId('total-price')
    const car = page.locator('img[alt^="Velô Sprint"]')
    await expect(priceElement).toBeVisible()
    await expect(priceElement).toHaveText('R$ 40.000,00') 

    await page.getByRole('button', { name: /Sport Wheels/ }).click()
    await expect(priceElement).toHaveText('R$ 42.000,00')
    

    await expect(car).toHaveAttribute('src', '/src/assets/glacier-blue-sport-wheels.png')

    await page.getByRole('button', { name: /Aero Wheels/ }).click()
    await expect(priceElement).toHaveText('R$ 40.000,00')
    await expect(car).toHaveAttribute('src', '/src/assets/glacier-blue-aero-wheels.png')
  })

})
