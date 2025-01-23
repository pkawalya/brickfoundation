import { useState, useEffect } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { validatePassword, getPasswordStrengthColor, getPasswordFeedback } from '../../utils/passwordValidation';

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  showStrengthMeter?: boolean;
  autoComplete?: string;
  error?: string;
  required?: boolean;
}

export function PasswordInput({
  id,
  value,
  onChange,
  label,
  showStrengthMeter = false,
  autoComplete = 'new-password',
  error,
  required = true
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (value) {
      const validation = validatePassword(value);
      setStrength(validation.strength);
    }
  }, [value]);

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete={autoComplete}
          required={required}
          className={`appearance-none block w-full px-3 py-2 border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm placeholder-gray-400 
          focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
          sm:text-sm pr-10 ${error ? 'text-red-900' : ''}`}
          placeholder="••••••••"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOffIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <EyeIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Password strength meter */}
      {showStrengthMeter && value && (
        <div className="mt-2 space-y-2">
          <div className="flex space-x-1 h-1">
            <div className={`flex-1 rounded-full transition-colors duration-200 ${
              strength === 'weak' ? getPasswordStrengthColor('weak') : 'bg-gray-200'
            }`} />
            <div className={`flex-1 rounded-full transition-colors duration-200 ${
              strength === 'medium' ? getPasswordStrengthColor('medium') : 'bg-gray-200'
            }`} />
            <div className={`flex-1 rounded-full transition-colors duration-200 ${
              strength === 'strong' ? getPasswordStrengthColor('strong') : 'bg-gray-200'
            }`} />
          </div>
          {isFocused && (
            <p className={`text-sm ${
              strength === 'weak' ? 'text-red-600' :
              strength === 'medium' ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {getPasswordFeedback(strength)}
            </p>
          )}
        </div>
      )}

      {/* Password requirements */}
      {showStrengthMeter && isFocused && (
        <ul className="mt-2 text-sm text-gray-500 space-y-1">
          <li className={`flex items-center ${
            value.length >= 8 ? 'text-green-600' : ''
          }`}>
            • At least 8 characters
          </li>
          <li className={`flex items-center ${
            /[A-Z]/.test(value) ? 'text-green-600' : ''
          }`}>
            • One uppercase letter
          </li>
          <li className={`flex items-center ${
            /[a-z]/.test(value) ? 'text-green-600' : ''
          }`}>
            • One lowercase letter
          </li>
          <li className={`flex items-center ${
            /[0-9]/.test(value) ? 'text-green-600' : ''
          }`}>
            • One number
          </li>
          <li className={`flex items-center ${
            /[!@#$%^&*(),.?":{}|<>]/.test(value) ? 'text-green-600' : ''
          }`}>
            • One special character
          </li>
        </ul>
      )}
    </div>
  );
}
