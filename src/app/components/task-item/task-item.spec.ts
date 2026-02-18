import { render, screen, fireEvent } from '@testing-library/angular';
import '@testing-library/jest-dom';
import { TaskItem } from './task-item';
import { Task } from '../../services/task/task.service';

describe('TaskItem', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    createdAt: '2026-01-01'
  };

  it('should render task title', async () => {
    await render(TaskItem, {
      componentInputs: {
        task: mockTask
      }
    });

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should render task description', async () => {
    await render(TaskItem, {
      componentInputs: {
        task: mockTask
      }
    });

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should show unchecked checkbox for incomplete task', async () => {
    await render(TaskItem, {
      componentInputs: {
        task: mockTask
      }
    });

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('should show checked checkbox for completed task', async () => {
    const completedTask = { ...mockTask, completed: true };

    await render(TaskItem, {
      componentInputs: {
        task: completedTask
      }
    });

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('should emit toggle event when checkbox is clicked', async () => {
    const { fixture } = await render(TaskItem, {
      componentInputs: {
        task: mockTask
      }
    });

    const spy = jest.fn();
    fixture.componentInstance.toggle.subscribe(spy);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(spy).toHaveBeenCalledWith('1');
  });

  it('should emit delete event when delete button is clicked', async () => {
    const { fixture } = await render(TaskItem, {
      componentInputs: {
        task: mockTask
      }
    });

    const spy = jest.fn();
    fixture.componentInstance.delete.subscribe(spy);

    global.confirm = jest.fn(() => true);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith('Are you sure?');
    expect(spy).toHaveBeenCalledWith('1');
  });

  it('should not emit delete event when confirmation is cancelled', async () => {
    const { fixture } = await render(TaskItem, {
      componentInputs: {
        task: mockTask
      }
    });

    const spy = jest.fn();
    fixture.componentInstance.delete.subscribe(spy);

    global.confirm = jest.fn(() => false);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should apply completed class when task is completed', async () => {
    const completedTask = { ...mockTask, completed: true };

    const { container } = await render(TaskItem, {
      componentInputs: {
        task: completedTask
      }
    });

    const taskItem = container.querySelector('.task-item');
    expect(taskItem).toHaveClass('completed');
  });

  it('should show "Overdue" badge when task is overdue', async () => {
    const overdueTask: Task = {
      ...mockTask,
      createdAt: '2025-01-01'  // Past date
    };

    await render(TaskItem, {
      componentInputs: {
        task: overdueTask
      }
    });

    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('should not show "Overdue" badge for completed task', async () => {
    const completedOverdueTask: Task = {
      ...mockTask,
      createdAt: '2025-01-01',
      completed: true
    };

    await render(TaskItem, {
      componentInputs: {
        task: completedOverdueTask
      }
    });

    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
  });
});
