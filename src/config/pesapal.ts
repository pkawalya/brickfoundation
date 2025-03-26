export const PESAPAL_CONFIG = {
  CONSUMER_KEY: import.meta.env.VITE_PESAPAL_CONSUMER_KEY,
  CONSUMER_SECRET: import.meta.env.VITE_PESAPAL_CONSUMER_SECRET,
  BASE_URL: import.meta.env.VITE_PESAPAL_BASE_URL,
  SANDBOX_URL: import.meta.env.VITE_PESAPAL_SANDBOX_URL,
  CALLBACK_URL: `${import.meta.env.VITE_SITE_URL}/auth/payment/callback`,
  IPN_ID: import.meta.env.VITE_PESAPAL_IPN_ID,
  CURRENCY: import.meta.env.VITE_PESAPAL_CURRENCY,
  REGISTRATION_FEE: Number(import.meta.env.VITE_PESAPAL_REGISTRATION_FEE),
  IS_SANDBOX: import.meta.env.VITE_PESAPAL_IS_SANDBOX === 'true',
  BRANCH: import.meta.env.VITE_PESAPAL_BRANCH,
  CHANNEL: import.meta.env.VITE_PESAPAL_CHANNEL,
  LANGUAGE: import.meta.env.VITE_PESAPAL_LANGUAGE,
  REDIRECT_MODE: import.meta.env.VITE_PESAPAL_REDIRECT_MODE
};
