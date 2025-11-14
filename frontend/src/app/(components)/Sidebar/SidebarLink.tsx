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
    <Link href={href} passHref>
      <div
        className={`cursor-pointer border-b border-b-gray-300 dark:border-b-gray-700 flex items-center ${
          isCollapsed ? 'justify-center py-4' : 'justify-start px-6 py-4'
        } gap-3 transition-colors duration-200 ${
          theme === 'dark'
            ? `${
                isActive
                  ? 'text-white bg-blue-600' // Active state in dark mode
                  : 'text-slate-300 hover:text-white hover:bg-blue-500/30' // Hover state in dark mode
              }`
            : `${
                isActive
                  ? 'text-gray-900 bg-blue-200' // Active state in light mode
                  : 'text-slate-700 hover:text-gray-900 hover:bg-blue-100' // Hover state in light mode
              }`
        }`}
      >
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
