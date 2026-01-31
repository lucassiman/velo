import { test, expect } from '@playwright/test';

// AAA - Arrange, Act, Assert

test('test', async ({ page }) => {

  // Arrange
  await page.goto('http://localhost:5173/');
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
  await page.getByRole('link', { name: 'Consultar Pedido' }).click();
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido');


  // Act
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-CPEA6E');
  await page.getByRole('button', { name: 'Buscar Pedido' }).click();

  // Assert
  //await expect(page.getByTestId('order-result-id')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('VLO-CPEA6E')).toBeVisible();
  await expect(page.locator('#root')).toContainText('VLO-CPEA6E');
 
  await expect(page.getByText('APROVADO')).toBeVisible();
  await expect(page.locator('#root')).toContainText('APROVADO');;

  
  

});