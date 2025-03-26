import { supabaseAdmin } from '../utils/supabaseAdmin';

export const databaseOperations = {
  // Example: Create a new table
  async createTable(tableName: string, columns: Record<string, any>) {
    try {
      // This is just an example - modify according to your needs
      const { data, error } = await supabaseAdmin.rpc('create_table', {
        table_name: tableName,
        columns: columns
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    }
  },

  // Example: Modify a table
  async alterTable(tableName: string, operation: string) {
    try {
      const { data, error } = await supabaseAdmin.rpc('alter_table', {
        table_name: tableName,
        operation: operation
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error modifying table:', error);
      throw error;
    }
  },

  // Empty users table
  async emptyUsersTable() {
    try {
      // Delete all users using Supabase Auth API
      const { data: users, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (fetchError) throw fetchError;

      // Delete each user except system users
      for (const user of users.users) {
        if (user.id !== '00000000-0000-0000-0000-000000000000') {
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
          if (deleteError) throw deleteError;
        }
      }

      // Delete all rows from public.users table if it exists
      const { error: publicError } = await supabaseAdmin
        .from('users')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (publicError && publicError.code !== 'PGRST116') { // Ignore if table doesn't exist
        throw publicError;
      }

      return { success: true, message: 'Users tables emptied successfully' };
    } catch (error) {
      console.error('Error emptying users tables:', error);
      throw error;
    }
  },

  // Configure auth settings
  async configureAuthSettings() {
    try {
      // Update auth settings using Admin API
      const { error } = await supabaseAdmin.auth.admin.updateConfig({
        email_confirmation_required: true,
        email_signin_enabled: true
      });

      if (error) throw error;

      return { success: true, message: 'Auth settings configured successfully' };
    } catch (error) {
      console.error('Error configuring auth settings:', error);
      throw error;
    }
  },

  // Add phone_confirmed column to users table
  async addPhoneConfirmedColumn() {
    try {
      await supabaseAdmin.rpc('add_column_if_not_exists', {
        p_table: 'users',
        p_column: 'phone_confirmed',
        p_type: 'boolean',
        p_default: 'false'
      });
      return { success: true, message: 'phone_confirmed column added successfully' };
    } catch (error) {
      console.error('Error adding phone_confirmed column:', error);
      throw error;
    }
  },

  // Add more database operations as needed
};
