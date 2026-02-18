import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TaskStateService } from './task-state.service';
import { Task } from '../task/task.service';

describe('TaskStateService', () => {
  let service: TaskStateService;

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      completed: false,
      createdAt: '2026-01-01'
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      completed: true,
      createdAt: '2026-01-02'
    },
    {
      id: '3',
      title: 'Task 3',
      description: 'Description 3',
      completed: false,
      createdAt: '2026-01-03'
    }
  ];

  // jest.spyOn(Storage.prototype, 'setItem');
  // jest.spyOn(Storage.prototype, 'getItem');
  // jest.spyOn(Storage.prototype, 'clear');

  beforeEach(() => {
    TestBed.configureTestingModule({});

    // Clear localStorage before each test
    localStorage.clear();
    service = TestBed.inject(TaskStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should have empty tasks initially', () => {
      expect(service.tasks()).toEqual([]);
    });

    it('should have "all" filter initially', () => {
      expect(service.filter()).toBe('all');
    });

    it('should not be loading initially', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('should have no error initially', () => {
      expect(service.errorMessage()).toBeNull();
    });
  });

  describe('setTasks', () => {
    it('should set tasks', () => {
      // Act
      service.setTasks(mockTasks);

      // Assert
      expect(service.tasks()).toEqual(mockTasks);
      expect(service.tasks().length).toBe(3);
    });

    it('should set isLoading to false', () => {
      // Arrange
      service.setLoading(true);

      // Act
      service.setTasks(mockTasks);

      // Assert
      expect(service.isLoading()).toBe(false);
    });

    it('should clear error message', () => {
      // Arrange
      service.setError('Some error');

      // Act
      service.setTasks(mockTasks);

      // Assert
      expect(service.errorMessage()).toBeNull();
    });
  });

  describe('Computed Signals', () => {
    beforeEach(() => {
      service.setTasks(mockTasks);
    });

    it('should compute tasksCount correctly', () => {
      expect(service.tasksCount()).toBe(3);
    });

    it('should compute completedCount correctly', () => {
      expect(service.completedCount()).toBe(1);
    });

    it('should compute activeCount correctly', () => {
      expect(service.activeCount()).toBe(2);
    });

    describe('filteredTasks', () => {
      it('should return all tasks when filter is "all"', () => {
        service.setFilter('all');
        expect(service.filteredTasks()).toEqual(mockTasks);
        expect(service.filteredTasks().length).toBe(3);
      });

      it('should return only completed tasks when filter is "completed"', () => {
        service.setFilter('completed');
        const filtered = service.filteredTasks();

        expect(filtered.length).toBe(1);
        expect(filtered[0].completed).toBe(true);
        expect(filtered[0].id).toBe('2');
      });

      it('should return only active tasks when filter is "active"', () => {
        service.setFilter('active');
        const filtered = service.filteredTasks();

        expect(filtered.length).toBe(2);
        expect(filtered.every(t => !t.completed)).toBe(true);
      });
    });
  });

  describe('addTask', () => {
    it('should add task to state', () => {
      // Arrange
      const newTask: Task = {
        id: '4',
        title: 'New Task',
        description: 'New Description',
        completed: false,
        createdAt: '2026-01-04'
      };

      // Act
      service.addTask(newTask);

      // Assert
      expect(service.tasks().length).toBe(1);
      expect(service.tasks()[0]).toEqual(newTask);
    });

    it('should preserve existing tasks', () => {
      // Arrange
      service.setTasks(mockTasks);
      const newTask: Task = {
        id: '4',
        title: 'New Task',
        description: '',
        completed: false,
        createdAt: '2026-01-04'
      };

      // Act
      service.addTask(newTask);

      // Assert
      expect(service.tasks().length).toBe(4);
      expect(service.tasks()[3]).toEqual(newTask);
    });
  });

  describe('updateTask', () => {
    beforeEach(() => {
      service.setTasks(mockTasks);
    });

    it('should update task properties', () => {
      // Act
      service.updateTask('1', { title: 'Updated Title' });

      // Assert
      const updatedTask = service.tasks().find(t => t.id === '1');
      expect(updatedTask?.title).toBe('Updated Title');
      expect(updatedTask?.description).toBe('Description 1'); // Unchanged
    });

    it('should not affect other tasks', () => {
      // Act
      service.updateTask('1', { completed: true });

      // Assert
      const otherTasks = service.tasks().filter(t => t.id !== '1');
      expect(otherTasks).toEqual([mockTasks[1], mockTasks[2]]);
    });
  });

  describe('deleteTask', () => {
    beforeEach(() => {
      service.setTasks(mockTasks);
    });

    it('should remove task from state', () => {
      // Act
      service.deleteTask('2');

      // Assert
      expect(service.tasks().length).toBe(2);
      expect(service.tasks().find(t => t.id === '2')).toBeUndefined();
    });

    it('should keep other tasks intact', () => {
      // Act
      service.deleteTask('2');

      // Assert
      const remainingIds = service.tasks().map(t => t.id);
      expect(remainingIds).toEqual(['1', '3']);
    });
  });

  describe('toggleTask', () => {
    beforeEach(() => {
      service.setTasks(mockTasks);
    });

    it('should toggle completed status from false to true', () => {
      // Arrange
      const taskId = '1';
      const initialStatus = service.tasks().find(t => t.id === taskId)?.completed;
      expect(initialStatus).toBe(false);

      // Act
      service.toggleTask(taskId);

      // Assert
      const newStatus = service.tasks().find(t => t.id === taskId)?.completed;
      expect(newStatus).toBe(true);
    });

    it('should toggle completed status from true to false', () => {
      // Arrange
      const taskId = '2';
      const initialStatus = service.tasks().find(t => t.id === taskId)?.completed;
      expect(initialStatus).toBe(true);

      // Act
      service.toggleTask(taskId);

      // Assert
      const newStatus = service.tasks().find(t => t.id === taskId)?.completed;
      expect(newStatus).toBe(false);
    });
  });

  describe('setFilter', () => {
    it('should update filter', () => {
      service.setFilter('completed');
      expect(service.filter()).toBe('completed');
    });

    // it('should save filter to localStorage', fakeAsync(() => {
    //   service.setFilter('active');

    //   tick(); // Simulate passage of time for debounce
    //   expect(localStorage.setItem).toHaveBeenCalledWith('taskFilter', 'active');
    // }));
  });

  describe('localStorage sync', () => {
    it('should load saved filter from localStorage on init', () => {
      TestBed.resetTestingModule();

      // Arrange
      (localStorage.getItem as jest.Mock).mockReturnValue('completed');

      // Act
      const newService = TestBed.inject(TaskStateService);

      // Assert
      expect(newService.filter()).toBe('completed');
    });
  });

  describe('reset', () => {
    it('should reset state to initial', () => {
      // Arrange
      service.setTasks(mockTasks);
      service.setFilter('completed');
      service.setLoading(true);
      service.setError('Some error');

      // Act
      service.reset();

      // Assert
      expect(service.tasks()).toEqual([]);
      expect(service.filter()).toBe('all');
      expect(service.isLoading()).toBe(false);
      expect(service.errorMessage()).toBeNull();
    });
  });
});
