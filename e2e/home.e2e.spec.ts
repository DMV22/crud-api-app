import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display welcome message and navigation', async ({ page }) => {
    await page.goto('/home');

    // Заголовок
    await expect(page.getByRole('heading', { level: 2 })).toContainText(/welcome/i);

    // Статистика задач (якщо є)
    await expect(page.getByText(/You have \d+ tasks/i)).toBeVisible();

    // Кнопка переходу до tasks
    const goToTasksButton = page.getByRole('button', { name: /go to tasks/i });
    await expect(goToTasksButton).toBeVisible();

    // Перехід до /tasks
    await goToTasksButton.click();
    await expect(page).toHaveURL(/\/tasks/);
  });
});
