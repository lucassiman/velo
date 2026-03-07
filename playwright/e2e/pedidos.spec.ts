import { test } from '@playwright/test'

import { generateOrderCode } from '../support/helpers'

import { HomePage } from '../support/pages/HomePage'
import { NavBar } from '../support/components/NavBarComponent'
import { OrderLockupPage, OrderDetails } from '../support/pages/OrderLockupPage'


test.describe('Consulta de Pedido', () => {
  let orderLockupPage: OrderLockupPage

  test.beforeEach(async ({ page }) => {
    await new HomePage(page).goto()
    await new NavBar(page).orderLockupLink()
    orderLockupPage = new OrderLockupPage(page)
    await orderLockupPage.validatePageLoaded()
  })

  test('deve consultar um pedido aprovado', async ({ page }) => {
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
 
    await orderLockupPage.searchOrder(order.number)

    await orderLockupPage.validateOrderDetails(order)
    await orderLockupPage.validateStatusBadge(order.status)

  })

  test('deve consultar um pedido reprovado', async ({ page }) => {
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

    await orderLockupPage.searchOrder(order.number)

    await orderLockupPage.validateOrderDetails(order)
    await orderLockupPage.validateStatusBadge(order.status)
  })

  test('deve consultar um pedido em analise', async ({ page }) => {
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

    await orderLockupPage.searchOrder(order.number)

    await orderLockupPage.validateOrderDetails(order)
    await orderLockupPage.validateStatusBadge(order.status)
  })

  test('deve exibir mensagem quando o pedido não é encontrado', async ({ page }) => {
    const order = generateOrderCode()

    await orderLockupPage.searchOrder(order)

    await orderLockupPage.validateOrderNotFound()
  })

  test('deve exibir mensagem quando o código do pedido está fora do padrão', async ({ page }) => {
    await orderLockupPage.searchOrder('INVALIDO-123')

    await orderLockupPage.validateOrderNotFound()
  })
})
