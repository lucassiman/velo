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

    test.describe('Fluxo Feliz', () => {

        test('CT05 - deve criar um pedido com pagamento à vista', async ({ page, app }) => {
            
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

            // Arrange (Fluxo ponta a ponta)
            // 1. Landing Page
            await page.goto('/')
            await page.getByRole('link', { name: 'Configure Agora' }).click()
            
            // 2. Configurador (Opções padrão)
            await expect(page).toHaveURL(/\/configure/)
            await page.getByRole('button', { name: 'Monte o Seu' }).click()
            
            // 3. Checkout
            await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()

            // Act
            await app.checkout.fillCustomerlData(customerData)
            await app.checkout.selectStore(customerData.store)
            await app.checkout.selectPaymentMethod(customerData.paymentMethod)
            await app.checkout.expectOrderSummaryTotal(customerData.totalPrice)
            await app.checkout.acceptTerms()
            await app.checkout.submit()

            // Assert
            await app.checkout.expectResult('Pedido Aprovado!')

        })
    })
})
