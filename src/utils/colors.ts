export const brandColors = {
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  accent: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  }
} as const;

export const gradients = {
  primary: 'bg-gradient-to-br from-indigo-600 to-indigo-700',
  hero: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
  authLeft: 'bg-gradient-to-br from-indigo-600 to-indigo-700',
  authRight: 'bg-gradient-to-br from-indigo-50 via-white to-pink-50',
  card: 'bg-gradient-to-r from-indigo-500 to-purple-500',
} as const;
