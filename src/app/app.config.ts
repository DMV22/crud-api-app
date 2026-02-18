import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { TaskStateService } from './services/task-state/task-state.service';
import { TaskService } from './services/task/task.service';

export function initializeApp(
  taskState: TaskStateService,
  taskService: TaskService
) {
  return () => {
    return new Promise<void>((resolve) => {
      taskService.getTasks().subscribe({
        next: (tasks) => {
          taskState.setTasks(tasks);
          resolve();
        },
        error: () => resolve()  // Continue навіть при помилці
      });
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes,
      // Preload all lazy modules у фоні після initial load
      withPreloading(PreloadAllModules)
    ),
    provideClientHydration(withEventReplay()),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [TaskStateService, TaskService],
      multi: true
    }
  ]
};
