import { expect, test, type Page } from '@playwright/test';
import { installMockApi } from './support/mockApi';

const loginAsCustomer = async (page: Page) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('qa@example.com');
  await page.getByLabel('Contraseña').fill('12345678');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await expect(page).toHaveURL('/');
};

const prepareCheckoutReview = async (page: Page) => {
  await page.goto('/productos/prod-1');
  await page.getByRole('button', { name: 'Agregar al Carrito' }).click();

  await page.goto('/carrito');
  await expect(page.getByText('Notebook QA')).toBeVisible();
  await page.getByRole('button', { name: 'Proceder al Pago' }).click();

  await expect(page.getByRole('heading', { name: 'Finalizar Compra' })).toBeVisible();
  await page.getByPlaceholder('Ej: Av. Corrientes 1234, Piso 5, Depto B').fill('Av. QA 1234');
  await page.getByPlaceholder('Ej: Buenos Aires').fill('Buenos Aires');
  await page.getByPlaceholder('Ej: 1001').fill('1000');
  await page.getByRole('button', { name: 'Continuar al Pago' }).click();
  await expect(page.getByRole('heading', { name: 'Información de Pago' })).toBeVisible();
  await page.getByRole('button', { name: /Revis[aá].*Pedido/i }).click();
};

test.describe('frontend hardening', () => {
  test('loads tenant config and navigates catalog/detail', async ({ page }) => {
    await installMockApi(page);

    await page.goto('/');
    await expect(page.getByText('Todo por API')).toBeVisible();

    await page.goto('/productos');
    await expect(page.getByRole('heading', { name: 'Tienda QA' })).toBeVisible();
    await expect(page.getByText('Notebook QA')).toBeVisible();

    await page.getByRole('link', { name: /Notebook QA/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Notebook QA' })).toBeVisible();
  });

  test('redirects guest user to login when trying to buy', async ({ page }) => {
    await installMockApi(page);

    await page.goto('/productos/prod-1');
    await page.getByRole('button', { name: 'Agregar al Carrito' }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText('Iniciar Sesión').first()).toBeVisible();
  });

  test('completes checkout with mocked backend', async ({ page }) => {
    await installMockApi(page);

    await loginAsCustomer(page);
    await prepareCheckoutReview(page);
    await page.getByRole('button', { name: /Confirmar Pedido/i }).click();

    await expect(page).toHaveURL(/\/pedido-exitoso$/);
    await expect(page.getByRole('heading', { name: /Pedido Recibido/i })).toBeVisible();
    await expect(page.getByText(/Número de Orden/i)).toBeVisible();
  });

  test('keeps the user on checkout when backend cannot validate the informed payment', async ({ page }) => {
    await installMockApi(page, {
      submitFailure: {
        status: 402,
        message: 'Backend could not validate informed payment',
      },
    });

    await loginAsCustomer(page);
    await prepareCheckoutReview(page);
    await page.getByRole('button', { name: /Confirmar Pedido/i }).click();

    await expect(page).toHaveURL('/checkout');
    await expect(page.getByText('Pago no validado')).toBeVisible();
    await expect(page.getByText(/SO-/)).toBeVisible();
  });

  test('redirects to cart when checkout detects stock conflict', async ({ page }) => {
    await installMockApi(page, {
      submitFailure: {
        status: 409,
        message: 'Stock insuficiente para continuar con la reserva',
      },
    });

    await loginAsCustomer(page);
    await prepareCheckoutReview(page);
    await page.getByRole('button', { name: /Confirmar Pedido/i }).click();

    await expect(page).toHaveURL('/carrito');
    await expect(page.getByText('Stock insuficiente')).toBeVisible();
    await expect(page.getByText('Notebook QA').first()).toBeVisible();
  });

  test('redirects to login and preserves cart when session expires during checkout', async ({ page }) => {
    await installMockApi(page, {
      submitFailure: {
        status: 401,
        message: 'Session expired',
      },
    });

    await loginAsCustomer(page);
    await prepareCheckoutReview(page);
    await page.getByRole('button', { name: /Confirmar Pedido/i }).click();

    await expect(page).toHaveURL(/\/login\?session=expired$/);
    await expect(page.getByText(/Tu sesión expir/i).first()).toBeVisible();

    await page.goto('/carrito');
    await expect(page.getByText('Notebook QA')).toBeVisible();
  });

  test('survives invalid tenant config by falling back safely', async ({ page }) => {
    await installMockApi(page, {
      runtimePayload: {
        app: 'broken-payload',
      },
    });

    await page.goto('/productos');
    await expect(page.getByRole('heading', { name: 'Mi Tienda' })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Notebook QA')).toBeVisible({ timeout: 20000 });
  });
});
