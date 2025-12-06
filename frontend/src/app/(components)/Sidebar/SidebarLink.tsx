import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
}

export const SidebarLink = ({ href, icon: Icon, label, isCollapsed }: SidebarLinkProps) => {
  const { theme } = useTheme();
  const pathname = usePathname();
  const isActive = pathname === href || (pathname === '/' && href === '/dashboard');

  return (
    <Link href={href} passHref aria-label={label}>
      <div
        title={label}
        className={`group relative cursor-pointer flex items-center ${
          isCollapsed ? 'justify-center py-3 mx-1 my-1' : 'justify-start px-4 py-2 mx-2 my-1'
        } gap-3 transition-colors duration-200 rounded-lg ${
          theme === 'dark'
            ? `${isActive ? 'text-white bg-indigo-600/90 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'}`
            : `${isActive ? 'text-gray-900 bg-indigo-100 shadow-sm' : 'text-slate-700 hover:text-gray-900 hover:bg-indigo-50'}`
        }`}
      >
        {isActive && (
          <span className='absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-indigo-500' />
        )}
        <Icon
          className={`w-5 h-5 sm:w-6 sm:h-6 ${
            // Responsive icon size
            isActive
              ? theme === 'dark'
                ? 'text-white'
                : 'text-gray-900'
              : theme === 'dark'
                ? 'text-slate-400 group-hover:text-white'
                : 'text-slate-600 group-hover:text-gray-900' // Adjusted icon color for hover
          }`}
        />
        <span
          className={`${
            isCollapsed ? 'hidden' : 'block'
          } font-medium text-xs sm:text-sm md:text-base ${
            // Responsive font sizes
            isActive
              ? theme === 'dark'
                ? 'text-white'
                : 'text-gray-900'
              : theme === 'dark'
                ? 'text-inherit'
                : 'text-inherit'
          }`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
};

export default SidebarLink; // Added default export for completeness if it's a standalone file
