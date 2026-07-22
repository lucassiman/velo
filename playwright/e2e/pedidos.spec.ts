import { expect, test } from '../support/fixtures'
import crypto from 'node:crypto'

import { generateOrderCode } from '../support/helpers'
import { OrderDetails } from '../support/actions/orderLockupActions'
import { insertOrder, deleteOrder } from '../support/database/orders'

test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ app }) => {
    await app.orderLockup.open()
  })

  test('deve consultar um pedido aprovado', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-SE4R01',
      status: 'APROVADO' as const,
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Lucas Siman',
        email: 'lucas@velo.dev'
      },
      payment: 'À Vista'
    }

    await deleteOrder(order.number)

    await insertOrder({
      id: crypto.randomUUID(),
      order_number: order.number,
      color: 'midnight-black',
      wheel_type: 'sport',
      customer_name: order.customer.name,
      customer_email: order.customer.email,
      customer_phone: '11999999999',
      customer_cpf: '12345678901',
      payment_method: 'avista',
      total_price: '42000',
      status: 'APROVADO',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      optionals: []
    })
 
    await app.orderLockup.searchOrder(order.number)

    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
    
  })

  test('deve consultar um pedido reprovado', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-SE4R02',
      status: 'REPROVADO' as const,
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Lino Jordan',
        email: 'lino@hpw.com.br'
      },
      payment: 'À Vista'
    }

    await deleteOrder(order.number)

    await insertOrder({
      id: crypto.randomUUID(),
      order_number: order.number,
      color: 'midnight-black',
      wheel_type: 'sport',
      customer_name: order.customer.name,
      customer_email: order.customer.email,
      customer_phone: '11999999998',
      customer_cpf: '12345678902',
      payment_method: 'avista',
      total_price: '42000',
      status: 'REPROVADO',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      optionals: []
    })

    await app.orderLockup.searchOrder(order.number)

    await app.orderLockup.validateOrderDetails(order)
    await app.orderLockup.validateStatusBadge(order.status)
    
  })

  test('deve consultar um pedido em analise', async ({ app }) => {
    const order: OrderDetails = {
      number: 'VLO-SE4R03',
      status: 'EM_ANALISE' as const,
      color: 'Glacier Blue',
      wheels: 'aero Wheels',
      customer: {
        name: 'Luna Love',
        email: 'luna@dev.com'
      },
      payment: 'À Vista'
    }

    await deleteOrder(order.number)

    await insertOrder({
      id: crypto.randomUUID(),
      order_number: order.number,
      color: 'glacier-blue',
      wheel_type: 'aero',
      customer_name: order.customer.name,
      customer_email: order.customer.email,
      customer_phone: '11999999997',
      customer_cpf: '12345678903',
      payment_method: 'avista',
      total_price: '40000',
      status: 'EM_ANALISE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      optionals: []
    })

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
