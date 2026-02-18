import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environments.prod';

export interface Task {
  id: string;
  title: string;
  description?: string;  // Новий опціональний field
  completed: boolean;
  createdAt?: string;
}

export type Filter = 'all' | 'completed' | 'active';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private http: HttpClient) { }

  private readonly apiUrl = `${environment.apiUrl}/tasks`;

  // READ operations
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      catchError(this.handleError<Task[]>("getTasks", []))
    )
  }

  getTaskById(id: string): Observable<Task | undefined> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError<Task | undefined>('getTaskById', undefined))
    )
  }

  // Search operation

  searchTasks(query: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}?q=${query}`).pipe(
      tap(tasks => console.log(tasks)),
      catchError(this.handleError<Task[]>("searchTasks", [])))
  }

  // CREATE operation
  createTask(task: Omit<Task, 'id' | 'createdAt'>): Observable<Task> {
    const newTask = {
      ...task,
      createdAt: new Date().toISOString()
    }

    return this.http.post<Task>(this.apiUrl, newTask).pipe(
      tap(created => console.log(created)),
      catchError(this.handleError<Task>("createTask")
      ))
  }

  // UPDATE operations

  updateTask(id: string, updates: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, updates).pipe(
      tap(updated => console.log('Task updated:', updated)),
      catchError(this.handleError<Task>("updateTask"))
    )
  }

  replaceTask(id: string, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task).pipe(
      tap(replaced => console.log('Task replaced:', replaced)),
      catchError(this.handleError<Task>("replaceTask"))
    )
  }

  // DELETE operation

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log('Task deleted:', id)),
      catchError(this.handleError<void>('deleteTask'))
    )
  }

  toggleTaskStatus(id: string, completed: boolean): Observable<Task> {
    return this.updateTask(id, { completed });
  }

  // Error handling
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);

      // Повернути fallback значення або викинути помилку
      if (result !== undefined) {
        return of(result as T);
      }

      return throwError(() => new Error(`${operation} failed: ${error.message}`));
    };
  }
}
