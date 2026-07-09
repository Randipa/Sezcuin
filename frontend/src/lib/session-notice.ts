const SESSION_NOTICE_KEY = 'sezcuin-session-notice';

export function setSessionEndedNotice(message: string) {
  if (typeof window === 'undefined') {
    return;
  }
  window.sessionStorage.setItem(SESSION_NOTICE_KEY, message);
}

export function consumeSessionEndedNotice(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const message = window.sessionStorage.getItem(SESSION_NOTICE_KEY);
  if (message) {
    window.sessionStorage.removeItem(SESSION_NOTICE_KEY);
  }
  return message;
}
