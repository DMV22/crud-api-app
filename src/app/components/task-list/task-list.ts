import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskService, Filter } from '../../services/task/task.service';
import { TaskStateService } from '../../services/task-state/task-state.service';
import { RouterLink, RouterModule } from '@angular/router';
import { TaskItem } from '../task-item/task-item';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-task-list',
  imports: [FormsModule, CommonModule, RouterLink, RouterModule, ReactiveFormsModule, TaskItem, ScrollingModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskList implements OnInit {
  searchQuery = signal('');

  constructor(private taskService: TaskService) {
    // toObservable(this.searchQuery).pipe(
    //   debounceTime(300),
    //   distinctUntilChanged(),
    //   switchMap(query => {
    //     if (!query.trim()) {
    //       return of([]);  // Не робити запит для порожнього пошуку
    //     }
    //     return this.taskService.searchTasks(query);
    //   })
    // ).subscribe({
    //   next: (tasks) => {
    //     this.taskStateService.setTasks(tasks);
    //     console.log('Search results:', tasks);
    //   },
    //   error: (error) => {
    //     console.error('Search error:', error);
    //   }
    // });
  }

  private taskStateService = inject(TaskStateService);

  tasks = this.taskStateService.filteredTasks;
  filter = this.taskStateService.filter;
  isLoading = this.taskStateService.isLoading;
  errorMessage = this.taskStateService.errorMessage;

  displayedTasksCount = computed(() => this.displayedTasks().length);

  // Computed для search
  displayedTasks = computed(() => {
    const tasks = this.tasks();
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) {
      return tasks;
    }

    return tasks.filter(task =>
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query)
    );
  });

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskStateService.setLoading(true);

    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.taskStateService.setTasks(tasks);
      },
      error: (error) => {
        this.taskStateService.setError("Failed to load tasks");
        console.error(error);
      }
    })
  }


  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  onFilterChange(filter: Filter) {
    this.taskStateService.setFilter(filter);
  }

  toggleTask(task: any) {
    // Оптимістичне оновлення
    this.taskStateService.toggleTask(task.id);

    this.taskService.toggleTaskStatus(task.id, !task.completed).subscribe({
      error: (error) => {
        // Rollback при помилці
        this.taskStateService.toggleTask(task.id);
        this.taskStateService.setError('Failed to update task');
        console.error(error);
      }
    });
  }

  deleteTask(taskId: string) {
    // if (!confirm('Are you sure you want to delete this task?')) {
    //   return;
    // }

    // Оптимістичне видалення
    const originalTasks = this.taskStateService.tasks();
    this.taskStateService.deleteTask(taskId);

    this.taskService.deleteTask(taskId).subscribe({
      error: (error) => {
        // Rollback при помилці
        this.taskStateService.setTasks(originalTasks);
        this.taskStateService.setError('Failed to delete task');
        console.error(error);
      }
    });
  }

  trackByTaskId(index: number, task: any): string {
    return task.id;
  }

  onTaskToggle(taskId: string) {
    const task = this.tasks().find(t => t.id === taskId);
    if (task) {
      this.toggleTask(task);
    }
  }

  onTaskDelete(taskId: string) {
    this.deleteTask(taskId);
  }

}
