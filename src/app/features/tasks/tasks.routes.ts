import { Routes } from '@angular/router';
import { TaskList } from '../../components/task-list/task-list';
import { TaskDetail } from '../../components/task-detail/task-detail';
import { TaskForm } from '../../components/task-form/task-form';
import { authGuard } from '../../guards/auth.guard';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    component: TaskList,
    // canActivate: [authGuard]
  },
  {
    path: 'new',
    component: TaskForm,
    // canActivate: [authGuard]
  },
  {
    path: ':id',
    component: TaskDetail,
    // canActivate: [authGuard]
  },
  {
    path: ':id/edit',
    component: TaskForm,
    // canActivate: [authGuard]
  }
];
