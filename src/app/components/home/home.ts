import { ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { TaskService } from '../../services/task/task.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { User, Settings, UserService } from '../../services/user/user.service';
import { forkJoin } from 'rxjs';
import { TaskStateService } from '../../services/task-state/task-state.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private taskStateService = inject(TaskStateService);

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'auth') {
        this.authMessage.set('You must be logged in to view tasks!');
        setTimeout(() => this.authMessage.set(null), 3000);
      }
    });
  }

  user = signal<User | null>(null);
  settings = signal<Settings | null>(null);
  isLoading = signal(true);
  currentDate = new Date();

  authMessage = signal<string | null | undefined>(null);
  errorMessage = signal<string | null>(null);

  tasksCount = this.taskStateService.tasksCount;
  completedCount = this.taskStateService.completedCount;
  activeCount = this.taskStateService.activeCount;

  completionPercentage = computed(() => {
    const total = this.tasksCount();
    const completed = this.completedCount();
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  });

  ngOnInit(): void {
    this.isLoading.set(true);

    forkJoin({
      user: this.userService.getUser(),
      settings: this.userService.getSettings()
    }).subscribe({
      next: ({ user, settings }) => {
        this.user.set(user);
        this.settings.set(settings);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load data');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  goToTasks() {
    this.router.navigate(['/tasks']);
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
    this.taskStateService.reset();
  }
}
