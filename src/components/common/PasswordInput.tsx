import { useState, useEffect } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { validatePassword, getPasswordStrengthColor, getPasswordFeedback } from '../../utils/passwordValidation';

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  showStrengthMeter?: boolean;
  autoComplete?: string;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

export function PasswordInput({
  id,
  value,
  onChange,
  label,
  showStrengthMeter = false,
  autoComplete = 'new-password',
  error,
  required = true,
  icon
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
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete={autoComplete}
          required={required}
          className={`${icon ? 'pl-10' : 'pl-3'} appearance-none block w-full px-3 py-2 border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm placeholder-gray-400 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
          sm:text-sm pr-10 ${error ? 'text-red-900' : ''} transition-colors duration-200`}
          placeholder="••••••••"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 transition-colors duration-200"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOffIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 animate-fade-in">
          {error}
        </p>
      )}

      {/* Password strength meter */}
      {showStrengthMeter && value && (
        <div className="mt-2 space-y-2">
          <div className="flex space-x-1 h-1">
            <div className={`flex-1 rounded-full transition-all duration-300 ${
              strength === 'weak' ? getPasswordStrengthColor('weak') : 'bg-gray-200'
            }`} />
            <div className={`flex-1 rounded-full transition-all duration-300 ${
              strength === 'medium' ? getPasswordStrengthColor('medium') : 'bg-gray-200'
            }`} />
            <div className={`flex-1 rounded-full transition-all duration-300 ${
              strength === 'strong' ? getPasswordStrengthColor('strong') : 'bg-gray-200'
            }`} />
          </div>
          {isFocused && (
            <p className={`text-sm transition-colors duration-200 ${
              strength === 'weak' ? 'text-red-600' :
              strength === 'medium' ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {getPasswordFeedback(strength)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
