import { ChangeDetectorRef, Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../services/task/task.service';
import { CommonModule } from '@angular/common';
import { exhaustMap, of, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-task-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
})
export class TaskForm {
  taskForm!: FormGroup;
  isEditMode = false;
  taskId: string | null = null;
  isSubmitting = false;
  errorMessage: string | null = null;

  private saveClicks$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  private cancelClick$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Ініціалізувати форму
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      completed: [false]
    });

    // Перевірити чи це режим редагування
    this.taskId = this.route.snapshot.paramMap.get('id');

    if (this.taskId) {
      this.isEditMode = true;
      this.loadTask(this.taskId);
    }

    this.saveClicks$.pipe(
      exhaustMap(() => {
        if (this.taskForm.invalid) {
          return of(null);  // Не робити запит якщо форма невалідна
        }

        this.isSubmitting = true;
        this.cdr.detectChanges();

        const taskData = this.taskForm.value;

        if (this.isEditMode && this.taskId) {
          return this.taskService.updateTask(this.taskId, taskData);
        } else {
          return this.taskService.createTask(taskData);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result) => {
        if (result) {
          this.isSubmitting = false;
          this.router.navigate(['/tasks']);
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to save task';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTask(id: string) {
    this.taskService.getTaskById(id).pipe(
      takeUntil(this.cancelClick$)).subscribe({
        next: (task) => {
          if (task) {
            this.taskForm.patchValue({
              title: task.title,
              description: task.description || '',
              completed: task.completed
            });
          } else {
            this.errorMessage = 'Task not found';
            setTimeout(() => this.router.navigate(['/tasks']), 2000);
          }
        },
        error: (err) => {
          this.errorMessage = 'Failed to load task';
          console.error(err);
        }
      });
  }

  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    // Емітити клік замість прямого виклику subscribe
    this.saveClicks$.next();
  }

  onCancel() {
    if (this.isEditMode && this.taskId) {
      this.cancelClick$.next();  // Скасувати завантаження
      console.log('Loading cancelled');
    }

    this.router.navigate(['/tasks']);
  }

  // Getters для валідації в шаблоні
  get title() {
    return this.taskForm.get('title');
  }

  get description() {
    return this.taskForm.get('description');
  }
}
