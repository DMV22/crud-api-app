import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Task, TaskService } from '../../services/task/task.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.css',
})
export class TaskDetail implements OnInit {
  task: Task | undefined;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTask(id);
      this.cdr.detectChanges();
    }
  }

  loadTask(id: string) {
    this.isLoading = true;
    this.errorMessage = null;

    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        this.task = task;
        this.isLoading = false;
        this.cdr.detectChanges();
        if (!task) {
          this.errorMessage = 'Task not found';
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load task';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  toggleTask() {
    if (!this.task) return;

    const newStatus = !this.task.completed;
    this.task.completed = newStatus;

    this.taskService.toggleTaskStatus(this.task.id, newStatus).subscribe({
      error: (err) => {
        // Відкотити при помилці
        this.task!.completed = !newStatus;
        this.errorMessage = 'Failed to update task';
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  deleteTask() {
    if (!this.task || !confirm('Are you sure you want to delete this task?')) {
      return;
    }

    this.taskService.deleteTask(this.task.id).subscribe({
      next: () => {
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        this.errorMessage = 'Failed to delete task';
        console.error(err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/tasks']);
  }
}
