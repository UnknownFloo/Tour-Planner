import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  username: string;
  token: string;
  expiresInMinutes: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly token = signal<string | null>(null);
  readonly username = signal<string | null>(null);
  readonly userId = signal<number | null>(null);

  private readonly baseUrl = 'http://localhost:5073/api/auth';
  private readonly tokenCookieKey = 'tourplanner_token';
  private readonly userCookieKey = 'tourplanner_user';
  private readonly userIdCookieKey = 'tourplanner_user_id';
  private readonly cookieMaxAgeSeconds = 60 * 60 * 24 * 7;

  constructor(private http: HttpClient) {
    const savedToken = localStorage.getItem('tourplanner_token') ?? this.readCookie(this.tokenCookieKey);
    const savedUser = localStorage.getItem('tourplanner_user') ?? this.readCookie(this.userCookieKey);
    const savedUserId = localStorage.getItem('tourplanner_user_id') ?? this.readCookie(this.userIdCookieKey);

    if (savedToken) {
      this.token.set(savedToken);
      this.userId.set(savedUserId ? Number(savedUserId) : this.parseUserIdFromToken(savedToken));
      this.username.set(savedUser);
    }
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await firstValueFrom(this.http.post<AuthResponse>(`${this.baseUrl}/login`, request));
    this.setSession(response);
    return response;
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await firstValueFrom(this.http.post<AuthResponse>(`${this.baseUrl}/register`, request));
    this.setSession(response);
    return response;
  }

  logout(): void {
    this.token.set(null);
    this.username.set(null);
    this.userId.set(null);
    localStorage.removeItem('tourplanner_token');
    localStorage.removeItem('tourplanner_user');
    localStorage.removeItem('tourplanner_user_id');
    this.clearCookie(this.tokenCookieKey);
    this.clearCookie(this.userCookieKey);
    this.clearCookie(this.userIdCookieKey);
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  private setSession(response: AuthResponse) {
    const parsedUserId = this.parseUserIdFromToken(response.token);
    this.token.set(response.token);
    this.username.set(response.username);
    this.userId.set(parsedUserId);
    localStorage.setItem('tourplanner_token', response.token);
    localStorage.setItem('tourplanner_user', response.username);
    if (parsedUserId !== null) {
      localStorage.setItem('tourplanner_user_id', parsedUserId.toString());
      this.setCookie(this.userIdCookieKey, parsedUserId.toString());
    }
    this.setCookie(this.tokenCookieKey, response.token);
    this.setCookie(this.userCookieKey, response.username);
  }

  private setCookie(key: string, value: string) {
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${this.cookieMaxAgeSeconds}; SameSite=Lax`; 
  }

  private readCookie(key: string): string | null {
    const cookie = document.cookie.split('; ').find((item) => item.startsWith(`${key}=`));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
  }

  private clearCookie(key: string) {
    document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
  }

  private parseUserIdFromToken(token: string): number | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '='));
      const parsed = JSON.parse(decoded);
      return parsed.userId ? Number(parsed.userId) : null;
    } catch {
      return null;
    }
  }
}
