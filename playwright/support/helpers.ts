 import { Page } from '@playwright/test'

export function generateOrderCode() {
    // Gera 3 letras maiúsculas aleatórias
    const letras = Array.from({ length: 3 }, () => 
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    
    // Gera 6 caracteres alfanuméricos (letras maiúsculas e números)
    const alfanumericos = Array.from({ length: 6 }, () => {
      const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      return caracteres[Math.floor(Math.random() * caracteres.length)];
    }).join('');
    
    return `${letras}-${alfanumericos}`;
  }

export async function searchOrder(page: Page, orderNumber: string) {
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(orderNumber)
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()
}