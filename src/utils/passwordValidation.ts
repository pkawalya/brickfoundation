export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  // Basic requirements
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Calculate password strength
  let strengthScore = 0;
  
  // Length check
  if (password.length >= 12) strengthScore += 2;
  else if (password.length >= 10) strengthScore += 1;

  // Complexity checks
  if (/[A-Z].*[A-Z]/.test(password)) strengthScore += 1; // Multiple uppercase
  if (/[a-z].*[a-z]/.test(password)) strengthScore += 1; // Multiple lowercase
  if (/[0-9].*[0-9]/.test(password)) strengthScore += 1; // Multiple numbers
  if (/[!@#$%^&*(),.?":{}|<>].*[!@#$%^&*(),.?":{}|<>]/.test(password)) strengthScore += 2; // Multiple special chars
  
  // Mixed character types in sequence
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(password)) strengthScore += 2;

  // Determine strength based on score
  if (strengthScore >= 6) strength = 'strong';
  else if (strengthScore >= 3) strength = 'medium';

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'strong':
      return 'bg-green-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'weak':
      return 'bg-red-500';
  }
}

export function getPasswordFeedback(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'strong':
      return 'Great! This is a strong password.';
    case 'medium':
      return 'Good, but could be stronger. Try adding more special characters or numbers.';
    case 'weak':
      return 'This password is weak. Please make it more complex.';
  }
}
