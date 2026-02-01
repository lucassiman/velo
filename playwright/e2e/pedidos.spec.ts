import { test, expect } from '@playwright/test';
import { generateOrderCode } from './support/helpers';

// AAA - Arrange, Act, Assert

test.describe('Consultar Pedido', () => {

  test.beforeEach(async ({ page }) => { 
     // Arrange
    await page.goto('http://localhost:5173/');
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
    await page.getByRole('link', { name: 'Consultar Pedido' }).click();
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido');
  });

  test('test', async ({ page }) => {

    // Test Data
    const order = 'VLO-CPEA6E';
    
    // Act
    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order);
    await page.getByRole('button', { name: 'Buscar Pedido' }).click();
  
    // Assert
    //await expect(page.getByTestId('order-result-id')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(order)).toBeVisible();
  
    // const orderCode = page.locator('//p[text()="Pedido"]/..//p[text()="VLO-CPEA6E"]');
    // await expect(orderCode).toBeVisible({ timeout: 10000 });
  
    const containerPedido = page.getByRole('paragraph')
      .filter({ hasText: /^Pedido$/ })
      .locator('..') // Sobe para o elemento pai (a div que agrupa ambos)
  
    await expect(containerPedido).toContainText(order);	
    
    await expect(page.getByText('APROVADO')).toBeVisible();
  
  });
  
  test('deve exibir mensagem quando o pedido não é encontrado', async ({ page }) => {
  
    // Test Data
    const order = generateOrderCode();
  
    //Act
    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(order);
    await page.getByRole('button', { name: 'Buscar Pedido' }).click();
  
    // Assert
  
    // await expect(page.locator('#root')).toContainText('Pedido não encontrado');
    // await expect(page.locator('#root')).toContainText('Verifique o número do pedido e tente novamente');
  
    // const title = page.getByRole('heading', { name: 'Pedido não encontrado' });
    // await expect(title).toBeVisible();
  
    // const message = page.locator('p', { hasText: 'Verifique o número do pedido e tente novamente' });
    // await expect(message).toBeVisible();
  
    await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - heading "Pedido não encontrado" [level=3]
      - paragraph: Verifique o número do pedido e tente novamente
      `);
  
  });
  
});

