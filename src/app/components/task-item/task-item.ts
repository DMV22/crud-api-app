import { Component, computed, input, output } from '@angular/core';
import { Task } from '../../services/task/task.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-item',
  imports: [CommonModule, RouterLink],
  templateUrl: './task-item.html',
  styleUrl: './task-item.css',
})
export class TaskItem {
  // Input Signal (required)
  task = input.required<Task>();

  // Output Signals
  toggle = output<string>();  // Emit task ID
  delete = output<string>();  // Emit task ID

  // Computed на основі input
  isOverdue = computed(() => {
    const task = this.task();
    if (!task.createdAt) return false;
    return new Date(task.createdAt) < new Date() && !task.completed;
  });

  onToggle() {
    this.toggle.emit(this.task().id);
  }

  onDelete() {
    if (window.confirm('Are you sure?')) {
      this.delete.emit(this.task().id);
    }
  }
}
