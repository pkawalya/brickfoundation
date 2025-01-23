import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export function Logo({ variant = 'light', className = '' }: LogoProps) {
  return (
    <Link
      to="/"
      className={`flex items-center group ${className}`}
    >
      <div className="relative">
        <div className={`h-10 w-10 flex items-center justify-center rounded-lg bg-gradient-to-br transition-all duration-300 group-hover:scale-110 ${
          variant === 'light'
            ? 'from-white/20 to-white/5 shadow-lg shadow-white/10'
            : 'from-indigo-600 to-indigo-700 shadow-lg shadow-indigo-500/25'
        }`}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={`h-6 w-6 ${variant === 'light' ? 'text-white' : 'text-white'}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 9.5L12 4L21 9.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 13V19.4C19 19.7314 18.7314 20 18.4 20H5.6C5.26863 20 5 19.7314 5 19.4V13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 16H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className={`absolute -bottom-1 left-1/2 w-6 h-1 rounded-full transform -translate-x-1/2 transition-all duration-300 opacity-0 group-hover:opacity-100 ${
          variant === 'light' ? 'bg-white/20' : 'bg-indigo-500/50'
        }`} />
      </div>
      <div className={`ml-3 flex flex-col ${variant === 'light' ? 'text-white' : 'text-gray-900'}`}>
        <span className="text-lg font-bold leading-tight">The Brick</span>
        <span className={`text-xs tracking-wide ${
          variant === 'light' ? 'text-indigo-200' : 'text-indigo-600'
        }`}>
          Smart Referral Network
        </span>
      </div>
    </Link>
  );
}
