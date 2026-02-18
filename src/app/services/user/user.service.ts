import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environments.prod';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Settings {
  theme: 'light' | 'dark';
  notifications: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  getUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user`).pipe(
      catchError(error => {
        console.error('Failed to load user:', error);
        return throwError(() => error);
      })
    )
  }

  getSettings(): Observable<Settings> {
    return this.http.get<Settings>(`${this.apiUrl}/settings`).pipe(
      catchError(error => {
        console.error('Failed to load settings:', error);
        return throwError(() => error);
      })
    );
  }

}
