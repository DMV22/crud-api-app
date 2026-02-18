import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService, Task } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Description 1',
      completed: false,
      createdAt: '2026-01-01'
    },
    {
      id: '2',
      title: 'Test Task 2',
      description: 'Description 2',
      completed: true,
      createdAt: '2026-01-02'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Перевірити що немає outstanding HTTP requests
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTasks', () => {
    it('should return tasks from API', (done) => {
      // Arrange
      const expectedUrl = 'http://localhost:3000/tasks';

      // Act
      service.getTasks().subscribe({
        next: (tasks) => {
          // Assert
          expect(tasks).toEqual(mockTasks);
          expect(tasks.length).toBe(2);
          done();
        }
      });

      // Expect HTTP call
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');

      // Respond with mock data
      req.flush(mockTasks);
    });

    it('should handle error gracefully', (done) => {
      service.getTasks().subscribe({
        next: (tasks) => {
          // Should return empty array on error
          expect(tasks).toEqual([]);
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/tasks');
      req.error(new ProgressEvent('Network error'), { status: 500 });
    });
  });

  describe('getTaskById', () => {
    it('should return specific task', (done) => {
      const taskId = '1';
      const expectedTask = mockTasks[0];

      service.getTaskById(taskId).subscribe({
        next: (task) => {
          expect(task).toEqual(expectedTask);
          expect(task?.id).toBe(taskId);
          done();
        }
      });

      const req = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}`);
      expect(req.request.method).toBe('GET');
      req.flush(expectedTask);
    });

    // it('should return undefined when task not found', (done) => {
    //   const taskId = 'non-existent';

    //   service.getTaskById(taskId).subscribe({
    //     next: (task) => {
    //       expect(task).toBeUndefined();
    //       done();
    //     }
    //   });

    //   const req = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}`);
    //   req.error(new ProgressEvent('Not found'), { status: 404 });
    // });
  });

  describe('createTask', () => {
    it('should create new task', (done) => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        completed: false
      };

      const createdTask: Task = {
        id: '3',
        ...newTask,
        createdAt: new Date().toISOString()
      };

      service.createTask(newTask).subscribe({
        next: (task) => {
          expect(task).toEqual(createdTask);
          expect(task.id).toBeDefined();
          expect(task.createdAt).toBeDefined();
          done();
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/tasks');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.title).toBe(newTask.title);
      req.flush(createdTask);
    });
  });

  describe('updateTask', () => {
    it('should update task', (done) => {
      const taskId = '1';
      const updates = { title: 'Updated Title' };
      const updatedTask = { ...mockTasks[0], ...updates };

      service.updateTask(taskId, updates).subscribe({
        next: (task) => {
          expect(task.title).toBe('Updated Title');
          expect(task.id).toBe(taskId);
          done();
        }
      });

      const req = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush(updatedTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete task', (done) => {
      const taskId = '1';

      service.deleteTask(taskId).subscribe({
        next: () => {
          expect(true).toBe(true); // Successfully completed
          done();
        }
      });

      const req = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('toggleTaskStatus', () => {
    it('should toggle task completion status', (done) => {
      const taskId = '1';
      const completed = true;

      service.toggleTaskStatus(taskId, completed).subscribe({
        next: (task) => {
          expect(task.completed).toBe(completed);
          done();
        }
      });

      const req = httpMock.expectOne(`http://localhost:3000/tasks/${taskId}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ completed });
      req.flush({ ...mockTasks[0], completed });
    });
  });

  describe('searchTasks', () => {
    it('should search tasks by query', (done) => {
      const query = 'Test';
      const expectedUrl = `http://localhost:3000/tasks?q=${query}`;

      service.searchTasks(query).subscribe({
        next: (tasks) => {
          expect(tasks).toEqual(mockTasks);
          done();
        }
      });

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTasks);
    });
  });
});
