const RATE_LIMIT_KEY = 'emailRateLimit';
const COOLDOWN_PERIOD = 60 * 1000; // 60 seconds

export const checkRateLimit = (): { canSend: boolean; timeLeft: number } => {
  const lastAttempt = localStorage.getItem(RATE_LIMIT_KEY);
  if (!lastAttempt) {
    return { canSend: true, timeLeft: 0 };
  }

  const now = Date.now();
  const timeSinceLastAttempt = now - parseInt(lastAttempt);
  const timeLeft = Math.max(0, COOLDOWN_PERIOD - timeSinceLastAttempt);

  return {
    canSend: timeLeft === 0,
    timeLeft: Math.ceil(timeLeft / 1000) // Convert to seconds
  };
};

export const setRateLimit = () => {
  localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
};

export const formatTimeLeft = (seconds: number): string => {
  if (seconds <= 0) return '';
  return `Please wait ${seconds} seconds before requesting another code`;
};
