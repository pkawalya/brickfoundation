export const PESAPAL_CONFIG = {
  CONSUMER_KEY: 'CmDBcSQcP3p4krrNNb7ufrUn7qK6j2us',
  CONSUMER_SECRET: '6am5uuDHalbrInizsE6Aonoyfq8=',
  BASE_URL: 'https://pay.pesapal.com/v3', // Production URL
  SANDBOX_URL: 'https://cybqa.pesapal.com/pesapalv3', // Sandbox URL for testing
  CALLBACK_URL: `${import.meta.env.VITE_SITE_URL}/auth/payment/callback`,
  IPN_ID: 'brickfoundation_reg', // Shortened IPN ID
  CURRENCY: 'UGX',
  REGISTRATION_FEE: 900, // Registration fee in UGX
  IS_SANDBOX: true // Set to true for testing, false for production
};
