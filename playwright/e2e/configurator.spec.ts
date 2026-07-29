import { expect, test } from '../support/fixtures'

test.describe('Configuração do Veículo', () => {

  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
  })

  test('alterar a cor do veículo não deve impactar o preço base', async ({ app }) => {
    await app.configurator.expectTotalPrice('R$ 40.000,00')

    await app.configurator.selectColor('Midnight Black')
    await app.configurator.expectTotalPrice('R$ 40.000,00')

    await app.configurator.expectCarImageSrc(/midnight-black-aero-wheels/)
  })

  test('alterar as rodas do veículo deve atualizar o preço de venda', async ({ app }) => {
    await app.configurator.expectTotalPrice('R$ 40.000,00')

    await app.configurator.selectWheels(/Sport Wheels/)
    await app.configurator.expectTotalPrice('R$ 42.000,00')
    await app.configurator.expectCarImageSrc(/glacier-blue-sport-wheels/)

    await app.configurator.selectWheels(/Aero Wheels/)
    await app.configurator.expectTotalPrice('R$ 40.000,00')
    await app.configurator.expectCarImageSrc(/glacier-blue-aero-wheels/)
  })

  test('CT03 - opcionais atualizam o preço e o checkout persiste o total', async ({
    app,
    page
  }) => {
    await app.configurator.expectTotalPrice('R$ 40.000,00')

    await app.configurator.checkOptional(/Precision Park/)
    await app.configurator.expectTotalPrice('R$ 45.500,00')

    await app.configurator.checkOptional(/Flux Capacitor/)
    await app.configurator.expectTotalPrice('R$ 50.500,00')

    await app.configurator.uncheckOptional(/Flux Capacitor/)
    await app.configurator.expectTotalPrice('R$ 45.500,00')

    await app.configurator.uncheckOptional(/Precision Park/)
    await app.configurator.expectTotalPrice('R$ 40.000,00')

    await app.configurator.checkOptional(/Flux Capacitor/)
    await app.configurator.checkOptional(/Precision Park/)
    await app.configurator.expectTotalPrice('R$ 50.500,00')

    await app.configurator.finalizeConfiguration()

    await app.configurator.expectOrderSummaryDescriptionWithOptionals()
    await app.configurator.expectOrderSummaryTotal('R$ 50.500,00')
  })

})
