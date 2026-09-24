const SESSION_KEY = "panga_session_email";

export function getSessionEmail(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function isLoggedIn(): boolean {
  return !!getSessionEmail();
}

export function setSession(email: string): void {
  localStorage.setItem(SESSION_KEY, email);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
