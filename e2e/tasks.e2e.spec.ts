import { test, expect } from '@playwright/test';

test.describe.serial('Tasks CRUD', () => {
  const initialTitle = 'E2E Task';
  const updatedTitle = 'E2E Task Updated';

  test.beforeEach(async ({ page }) => {
    // Відкриваємо список задач
    await page.goto('/tasks');
    await expect(page.getByRole('heading', { level: 3 })).toContainText(/tasks/i);
  });

  test('should create a new task', async ({ page }) => {
    // Перейти на форму створення
    await page.getByRole('button', { name: /\+ new task/i }).click();
    await expect(page).toHaveURL(/\/tasks\/new/);

    // Заповнити форму
    await page.fill('input[id="title"]', initialTitle);
    await page.fill('textarea[id="description"]', 'Created via Playwright E2E');
    await page.getByRole('button', { name: /create/i }).click();

    // Після збереження повертаємось до списку
    await expect(page).toHaveURL(/\/tasks$/);

    // Нова задача має бути видима
    await expect(page.getByText(initialTitle)).toBeVisible();
  });

  test('should toggle task completion', async ({ page }) => {
    const taskItem = page.locator('.task-item')
      .filter({ has: page.getByRole('link', { name: initialTitle }) }); // або використай data-testid

    // Знайти checkbox у цьому item
    const checkbox = taskItem.getByRole('checkbox');

    // Початковий стан
    await expect(checkbox).not.toBeChecked();

    // Клік → completed
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Клік ще раз → знову active
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
  });

  test('should edit an existing task', async ({ page }) => {
    const taskRow = page.locator('.task-item')
      .filter({ has: page.getByRole('link', { name: initialTitle }) });
    const editButton = taskRow.getByRole('button', { name: /edit/i });

    await editButton.click();
    await expect(page).toHaveURL(/\/tasks\/.+\/edit/);

    // Оновити title
    await page.fill('input[id="title"]', updatedTitle);
    await page.getByRole('button', { name: /update/i }).click();

    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByText(updatedTitle)).toBeVisible();
  });

  test('should delete a task', async ({ page }) => {
    // Обробка confirm діалогу
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('Are you sure?');
      await dialog.accept(); // натискаємо OK
    });

    const taskRow = page.locator('.task-item')
      .filter({ has: page.getByRole('link', { name: updatedTitle }) });
    const deleteButton = taskRow.getByRole('button', { name: /delete/i });

    await deleteButton.click();

    await expect(
      page
        .locator('.task-item')
        .filter({ has: page.getByRole('link', { name: updatedTitle }) })
    ).toHaveCount(0);
  });
});

test.describe('Tasks filters & search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tasks');
  });

  test('should filter tasks by status', async ({ page }) => {
    // Створюємо задачу й робимо її completed
    await page.getByRole('button', { name: /new task/i }).click();
    await page.fill('#title', 'Filter Test Completed');
    await page.getByRole('button', { name: /create/i }).click();

    const taskRow = page
      .locator('.task-item')
      .filter({ hasText: 'Filter Test Completed' });
    const checkbox = taskRow.getByRole('checkbox');

    await checkbox.click(); // позначили як completed
    // Якщо в DOM реально з’являється клас:
    await expect(taskRow).toHaveClass(/completed/);

    // Вмикаємо Completed‑фільтр
    await page.getByLabel('Completed').click();

    // (Опціонально) перевіряємо, що саме наша задача видна
    await expect(page.getByText('Filter Test Completed')).toBeVisible();

    // Active‑фільтр
    await page.getByLabel('Active').click();
    const activeCount = await page.locator('.task-item').count();
    expect(activeCount).toBeGreaterThan(0);
  });

  test('should search tasks by title', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search tasks...');
    await searchInput.fill('build');

    // Debounce + HTTP → може зайняти трохи часу
    await page.waitForTimeout(500);

    // Переконатись, що видно тільки задачі, які містять "Unit tests"
    const results = page.locator('.task-item');
    const count = await results.count();

    for (let i = 0; i < count; i++) {
      const text = await results.nth(i).innerText();
      expect(text.toLowerCase()).toContain('build');
    }
  });
});

