import 'dotenv/config';
import { resetUsersAndConfigureAuth } from '../api/adminOperations';

async function main() {
  try {
    console.log('Starting database reset and auth configuration...');
    const result = await resetUsersAndConfigureAuth();
    console.log(result.message);
  } catch (error) {
    console.error('Failed to reset database:', error);
    process.exit(1);
  }
}

main();
