import { databaseOperations } from './database';

export async function resetUsersAndConfigureAuth() {
  try {
    // Empty the users tables
    await databaseOperations.emptyUsersTable();
    
    // Configure auth settings
    await databaseOperations.configureAuthSettings();
    
    return { success: true, message: 'Database reset and configured successfully' };
  } catch (error) {
    console.error('Error in resetUsersAndConfigureAuth:', error);
    throw error;
  }
}
