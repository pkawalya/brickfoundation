import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { gradients } from '../../utils/colors';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  type?: 'login' | 'register';
}

export function AuthLayout({ children, title, subtitle, type }: AuthLayoutProps) {
  return (
    <div className={`min-h-screen ${gradients.authRight}`}>
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className={`hidden lg:flex lg:w-1/2 ${gradients.authLeft} p-8 lg:p-12 flex-col justify-between relative overflow-hidden`}>
          <div className="absolute inset-0 bg-[url('/auth-pattern.svg')] opacity-10"></div>
          <div className="relative">
            <Logo variant="light" className="transform hover:scale-105 transition-transform duration-200" />
            <div className="mt-12 lg:mt-16">
              <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                Transform Your Network into Earnings
              </h1>
              <p className="mt-4 text-base lg:text-lg text-indigo-100">
                Join our community of entrepreneurs and start earning through smart referrals.
                Build your network, earn rewards, and unlock exclusive opportunities.
              </p>
            </div>
          </div>
          <div className="relative mt-8 lg:mt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    className="inline-block h-8 w-8 lg:h-10 lg:w-10 rounded-full ring-2 ring-white transform hover:scale-110 transition-transform duration-200"
                    src={`/avatar-${i}.svg`}
                    alt=""
                  />
                ))}
              </div>
              <div className="text-indigo-100">
                <p className="font-semibold text-sm lg:text-base">Join 2,000+ members</p>
                <p className="text-xs lg:text-sm">Already earning through referrals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="lg:hidden mb-6">
              <Logo variant="dark" className="transform hover:scale-105 transition-transform duration-200" />
            </div>
            <div>
              {title && (
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">{title}</h2>
              )}
              {subtitle && (
                <p className="mt-2 sm:mt-3 text-sm text-gray-600">
                  {subtitle}{' '}
                  {type === 'login' ? (
                    <Link 
                      to="/register" 
                      className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                    >
                      Create an account
                    </Link>
                  ) : (
                    <Link 
                      to="/login" 
                      className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                    >
                      Sign in to your account
                    </Link>
                  )}
                </p>
              )}
            </div>

            <div className="mt-6 sm:mt-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
