import { expect, test } from '../support/fixtures'

import { generateOrderCode } from '../support/helpers'
import { OrderDetails } from '../support/actions/orderLockupActions'

test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ app }) => {
    await app.orderLockup.open()
  })

  test('deve consultar um pedido aprovado', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-CPEA6E',
      status: 'APROVADO' as const,
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Lucas Siman',
        email: 'lucas@velo.dev'
      },
      payment: 'À Vista'
    }
 
    await app.orderLockup.searchOrder(order.number)

    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)

  })

  test('deve consultar um pedido reprovado', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-0LNFEA',
      status: 'REPROVADO' as const,
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Lino Jordan',
        email: 'lino@hpw.com.br'
      },
      payment: 'À Vista'
    }

    await app.orderLockup.searchOrder(order.number)

    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido em analise', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-B76FIK',
      status: 'EM_ANALISE' as const,
      color: 'Glacier Blue',
      wheels: 'aero Wheels',
      customer: {
        name: 'Luna Love',
        email: 'luna@dev.com'
      },
      payment: 'À Vista'
    }

    await app.orderLockup.searchOrder(order.number)

    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
  })

  test('deve exibir mensagem quando o pedido não é encontrado', async ({ app }) => {
    const order = generateOrderCode()

    await app.orderLockup.searchOrder(order)

    await app.orderLockup.validateOrderNotFound()
  })

  test('deve exibir mensagem quando o código do pedido está fora do padrão', async ({ app }) => {
    await app.orderLockup.searchOrder('INVALIDO-123')

    await app.orderLockup.validateOrderNotFound()
  })

  test('deve manter o botão de busca desabilitado com campo vazio ou apenas espaços', async ({ app, page }) => {    
    const button = app.orderLockup.elements.searchButton
    
    await expect(button).toBeDisabled()

    const orderInput = app.orderLockup.elements.orderInput
    await orderInput.fill('   ')

    await expect(button).toBeDisabled()


  })
})
