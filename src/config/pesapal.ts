export const PESAPAL_CONFIG = {
  CONSUMER_KEY: 'CmDBcSQcP3p4krrNNb7ufrUn7qK6j2us',
  CONSUMER_SECRET: '6am5uuDHalbrInizsE6Aonoyfq8=',
  BASE_URL: 'https://pay.pesapal.com/v3', // Production URL
  CALLBACK_URL: `${import.meta.env.VITE_SITE_URL}/auth/payment/callback`,
  IPN_ID: 'brickfoundation_registration', // Unique identifier for your IPN
  CURRENCY: 'UGX',
  REGISTRATION_FEE: 900 // 50,000 UGX registration fee
};
