export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  
  const KEY = "vo_quiz_session_id";
  let sessionId = localStorage.getItem(KEY);
  
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem(KEY, sessionId);
  }
  
  return sessionId;
}
