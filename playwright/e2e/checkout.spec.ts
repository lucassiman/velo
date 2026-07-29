import { expect, test } from '../support/fixtures'
import { deleteOrderByCpf } from '../support/database/orders'

test.describe('Checkout', () => {
    test.describe('Validações de campos obrigatórios', () => {

        let alerts: any

        test.beforeEach(async ({ page, app }) => {
            await page.goto('/order')
            await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()

            alerts = app.checkout.elements.alerts
        })


        test('deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {
            // Act
            await app.checkout.submit()

            // Assert
            await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
            await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
            await expect(alerts.email).toHaveText('Email inválido')
            await expect(alerts.phone).toHaveText('Telefone inválido')
            await expect(alerts.document).toHaveText('CPF inválido')
            await expect(alerts.store).toHaveText('Selecione uma loja')
            await expect(alerts.terms).toHaveText('Aceite os termos')
        })

        test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ app }) => {

            const customer = {
                name: 'A',
                lastname: 'B',
                email: 'lucas@test.com',
                document: '00000014141',
                phone: '(11) 99999-9999'
            }

            // Arrange
            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore('Velô Paulista')
            await app.checkout.acceptTerms()

            // Act
            await app.checkout.submit()

            // Assert
            await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
            await expect(alerts.lastname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
        })

        test('deve exibir erro para e-mail com formato inválido', async ({ app }) => {
            const customer = {
                name: 'Lucas',
                lastname: 'Siman',
                email: 'lucas@.com',
                document: '00000014141',
                phone: '(11) 99999-9999'
            }

            // Arrange
            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore('Velô Paulista')
            await app.checkout.acceptTerms()

            // Act
            await app.checkout.submit()

            // Assert
            await expect(alerts.email).toHaveText('Email inválido')
        })

        test('deve exibir erro para CPF inválido', async ({ app }) => {

            const customer = {
                name: 'Lucas',
                lastname: 'Siman',
                email: 'lucas@test.com',
                document: '00000014199',
                phone: '(11) 99999-9999'
            }

            // Arrange
            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore('Velô Paulista')
            await app.checkout.acceptTerms()

            // Act
            await app.checkout.submit()

            // Assert
            await expect(alerts.document).toHaveText('CPF inválido')
        })

        test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ app }) => {

            const customer = {
                name: 'Lucas',
                lastname: 'Siman',
                email: 'lucas@test.com',
                document: '00000014199',
                phone: '(11) 99999-9999'
            }

            // Arrange
            await app.checkout.fillCustomerlData(customer)
            await app.checkout.selectStore('Velô Paulista')

            await expect(app.checkout.elements.terms).not.toBeChecked()

            // Act
            await app.checkout.submit()

            // Assert
            await expect(alerts.terms).toHaveText('Aceite os termos')
        })
    })

    test.describe('Pagamento e Confirmação', () => {

        test.beforeEach(async ({ page, app }) => {
            await app.hero.open()
            await app.configurator.finalizeConfiguration()
        })

        test('deve criar um pedido com pagamento à vista', async ({ page, app }) => {

            const customerData = {
                name: 'Lucas',
                lastname: 'Siman',
                email: 'lucas.siman@example.com',
                document: '12345678909',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'À Vista',
                totalPrice: 'R$ 40.000,00'
            }

            await deleteOrderByCpf(customerData.document)

            await app.checkout.fillCustomerlData(customerData)
            await app.checkout.selectStore(customerData.store)
            await app.checkout.selectPaymentMethod(customerData.paymentMethod)
            await app.checkout.expectOrderSummaryTotal(customerData.totalPrice)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await app.checkout.expectResult('Pedido Aprovado!')

        })

        test('deve aprovar automaticamente o crédito quando o score do CPF for maior que 700 no financiamento.', async ({ page, app }) => {

            const customerData = {
                name: 'Augustus',
                lastname: 'Siman',
                email: 'siman.augustus@velo.dev',
                document: '52608846041',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'financiamento',
                totalPrice: 'R$ 40.000,00'
            }

            await deleteOrderByCpf(customerData.document)

            await app.mock.creditAnalysis(701)

            await app.checkout.fillCustomerlData(customerData)
            await app.checkout.selectStore(customerData.store)
            await app.checkout.selectPaymentMethod(customerData.paymentMethod)
            // await app.checkout.expectOrderSummaryTotal(customerData.totalPrice)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await app.checkout.expectResult('Pedido Aprovado!')

        })

        test('deve colocar o pedido em análise quando o score do CPF for entre 501 e 700 no financiamento', async ({ page, app }) => {

            const customerData = {
                name: 'Julia',
                lastname: 'Siman',
                email: 'siman.julia@velo.dev',
                document: '54438139007',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'financiamento',
                totalPrice: 'R$ 40.000,00'
            }

            await deleteOrderByCpf(customerData.document)

            await app.mock.creditAnalysis(600)

            await app.checkout.fillCustomerlData(customerData)
            await app.checkout.selectStore(customerData.store)
            await app.checkout.selectPaymentMethod(customerData.paymentMethod)
            // await app.checkout.expectOrderSummaryTotal(customerData.totalPrice)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await app.checkout.expectResult('Pedido em Análise!')

        })

        test('deve reprovar o crédito quando o score for menor ou igual a 500 e sem entrada no financiamento', async ({ page, app }) => {

            const customerData = {
                name: 'Maria',
                lastname: 'Siman',
                email: 'siman.maria@velo.dev',
                document: '71428793860',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'financiamento',
                totalPrice: 'R$ 40.000,00'
            }

            await deleteOrderByCpf(customerData.document)

            await app.mock.creditAnalysis(500)

            await app.checkout.fillCustomerlData(customerData)
            await app.checkout.selectStore(customerData.store)
            await app.checkout.selectPaymentMethod(customerData.paymentMethod)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await app.checkout.expectResult('Pedido Reprovado!')

        })

        test('deve reprovar o crédito quando o score for menor ou igual a 500 e entrada menor que 50% no financiamento', async ({ page, app }) => {

            const customerData = {
                name: 'Carlos',
                lastname: 'Siman',
                email: 'siman.carlos@velo.dev',
                document: '77706497062',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'financiamento',
                totalPrice: 'R$ 40.000,00',
                downPayment: '10000' // < 50% de R$ 40.000,00
            }

            await deleteOrderByCpf(customerData.document)

            await app.mock.creditAnalysis(450)

            await app.checkout.fillCustomerlData(customerData)
            await app.checkout.selectStore(customerData.store)
            await app.checkout.selectPaymentMethod(customerData.paymentMethod)
            await app.checkout.fillDownPayment(customerData.downPayment)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await app.checkout.expectResult('Pedido Reprovado!')

        })

        test('deve aprovar o crédito quando o score for menor ou igual a 500 e entrada igual que 50% no financiamento', async ({ page, app }) => {

            const customerData = {
                name: 'Pedro',
                lastname: 'Siman',
                email: 'siman.pedro@velo.dev',
                document: '71240139098',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'financiamento',
                totalPrice: 'R$ 40.000,00',
                downPayment: '20000' // > 50% de R$ 40.000,00
            }

            await deleteOrderByCpf(customerData.document)

            await app.mock.creditAnalysis(450)

            await app.checkout.fillCustomerlData(customerData)
            await app.checkout.selectStore(customerData.store)
            await app.checkout.selectPaymentMethod(customerData.paymentMethod)
            await app.checkout.fillDownPayment(customerData.downPayment)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await app.checkout.expectResult('Pedido Aprovado!')

        })

        test('deve aprovar o crédito quando o score for menor ou igual a 500 e entrada maior que 50% no financiamento', async ({ page, app }) => {

            const customerData = {
                name: 'Chico',
                lastname: 'Siman',
                email: 'siman.chico@velo.dev',
                document: '69316432073',
                phone: '(11) 99999-9999',
                store: 'Velô Paulista',
                paymentMethod: 'financiamento',
                totalPrice: 'R$ 40.000,00',
                downPayment: '30000' // > 50% de R$ 40.000,00
            }

            await deleteOrderByCpf(customerData.document)

            await app.mock.creditAnalysis(450)

            await app.checkout.fillCustomerlData(customerData)
            await app.checkout.selectStore(customerData.store)
            await app.checkout.selectPaymentMethod(customerData.paymentMethod)
            await app.checkout.fillDownPayment(customerData.downPayment)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            await app.checkout.expectResult('Pedido Aprovado!')

        })
    })


})
