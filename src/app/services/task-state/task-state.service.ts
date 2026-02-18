import { computed, effect, Injectable, Signal, signal } from '@angular/core';
import { Filter, Task } from '../task/task.service';

export interface TaskState {
  tasks: Task[];
  filter: Filter;
  isLoading: boolean;
  errorMessage: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TaskStateService {
  private state = signal<TaskState>({
    tasks: [],
    filter: 'all',
    isLoading: false,
    errorMessage: null,
  });

  tasks = computed(() => this.state().tasks);
  filter = computed(() => this.state().filter);
  isLoading = computed(() => this.state().isLoading);
  errorMessage = computed(() => this.state().errorMessage);

  constructor() {
    if (typeof window !== 'undefined') {
      effect(() => {
        const filter = this.filter();
        localStorage.setItem('taskFilter', filter);
        console.log('Filter saved to localStorage');
      });

      effect(() => {
        const count = this.tasksCount();
        localStorage.setItem('taskCount', String(count));

      })

      const savedFilter = localStorage.getItem('taskFilter') as Filter | null;
      if (savedFilter) {
        this.setFilter(savedFilter);
      }
    }
  }


  filteredTasks = computed(() => {
    const tasks = this.tasks();
    const filter = this.filter();

    switch (filter) {
      case 'completed':
        return tasks.filter(t => t.completed);
      case 'active':
        return tasks.filter(t => !t.completed);
      default:
        return tasks;
    }
  });

  tasksCount = computed(() => this.tasks().length);
  completedCount = computed(() => this.tasks().filter(t => t.completed).length);
  activeCount = computed(() => this.tasks().filter(t => !t.completed).length);

  // Actions для оновлення state
  setTasks(tasks: Task[]) {
    this.state.update(state => ({
      ...state,
      tasks,
      isLoading: false,
      errorMessage: null
    }));
  }

  setFilter(filter: Filter) {
    this.state.update(state => ({
      ...state,
      filter
    }));
  }

  setLoading(isLoading: boolean) {
    this.state.update(state => ({
      ...state,
      isLoading
    }));
  }

  setError(errorMessage: string | null) {
    this.state.update(state => ({
      ...state,
      errorMessage,
      isLoading: false
    }));
  }


  addTask(task: Task) {
    this.state.update((state) => {
      return {
        ...state,
        tasks: [...this.tasks(), task]
      }
    })
  }

  updateTask(id: string, updates: Partial<Task>) {
    this.state.update((state) => {
      return {
        ...state,
        tasks: state.tasks.map(task => task.id === id ? { ...task, ...updates } : task)
      }
    })
  }

  deleteTask(id: string) {
    this.state.update((state) => {
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== id)
      }
    })
  }

  toggleTask(id: string) {
    this.state.update((state) => {
      return {
        ...state,
        tasks: state.tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task)
      }
    })
  }

  reset() {
    this.state.set({
      tasks: [],
      filter: 'all',
      isLoading: false,
      errorMessage: null
    });
  }
}

