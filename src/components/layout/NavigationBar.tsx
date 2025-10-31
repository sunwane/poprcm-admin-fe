'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GradientAvatar from '../ui/GradientAvatar';

export default function NavigationBar() {
    const pathname = usePathname();
    
    const menuItems = [
        { name: 'Tổng quan', path: '/dashboard' },
        { name: 'Quản lí thể loại', path: '/genres' },
        { name: 'Quản lí series', path: '/series' },
        { name: 'Quản lí phim', path: '/movies' },
        { name: 'Quản lí diễn viên', path: '/actors' },
        { name: 'Quản lí quốc gia', path: '/country' },
        { name: 'Quản lí người dùng', path: '/users' },
    ];

    const isActiveLink = (path: string) => {
        return pathname === path;
    };

    return (
        <div className="border-r border-gray-200 h-screen max-w-64 w-64 bg-white shadow-lg sticky top-0 flex flex-col">
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-200">
                <img className="w-48" src="/Logo.png" alt="Logo"/>
            </div>
            
            {/* Navigation Menu */}
            <nav className="py-3">
                <div className="uppercase pb-3 px-3 text-sm font-semibold text-blue-950">
                    Menu Chính
                </div>
                <ul className="space-y-1 px-3">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link 
                                href={item.path}
                                className={`
                                    block py-3 pl-4 pr-3 transition-all duration-200 font-medium text-sm
                                    ${isActiveLink(item.path) 
                                        ? 'bg-blue-50 text-blue-800 border-l-5 shadow-md' 
                                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm'
                                    }
                                `}
                            >
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            
            {/* User Profile Section */}
            <div className={`py-4 px-3 border-t border-gray-200
                ${isActiveLink('/settings') 
                    ? 'space-y-3' 
                    : 'space-y-1.5'
                }`}>
                <Link 
                    className={`flex items-center space-x-2.5 py-2 px-1
                        ${isActiveLink('/settings') 
                            ? 'bg-blue-50 border-blue-800 border-l-5 shadow-md pl-3 pr-2 py-2.5' 
                            : 'text-gray-700 hover:bg-blue-50 hover:shadow-sm radiusd-lg hover:pl-4 hover:pr-2 hover:py-2.5'
                        }`}
                    href={'/settings'}>
                    <GradientAvatar initial="A" />
                    <div className="flex-1 max-w-32 truncate">
                        <div className="text-sm font-medium text-gray-900 truncate">Admin User</div>
                        <div className="text-xs text-gray-500 truncate">admin@example.com</div>
                    </div>
                    <svg className="w-6 h-6 text-gray-800 dark:text-blue-600 opacity-75" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path 
                            fillRule="evenodd" 
                            d="M17 10v1.126c.367.095.714.24 1.032.428l.796-.797 1.415 1.415-.797.796c.188.318.333.665.428 
                            1.032H21v2h-1.126c-.095.367-.24.714-.428 1.032l.797.796-1.415 1.415-.796-.797a3.979 3.979 0 0 
                            1-1.032.428V20h-2v-1.126a3.977 3.977 0 0 1-1.032-.428l-.796.797-1.415-1.415.797-.796A3.975 3.975 
                            0 0 1 12.126 16H11v-2h1.126c.095-.367.24-.714.428-1.032l-.797-.796 1.415-1.415.796.797A3.977 3.977 
                            0 0 1 15 11.126V10h2Zm.406 3.578.016.016c.354.358.574.85.578 1.392v.028a2 2 0 0 1-3.409 1.406l-.01-.012a2 
                            2 0 0 1 2.826-2.83ZM5 8a4 4 0 1 1 7.938.703 7.029 7.029 0 0 0-3.235 3.235A4 4 0 0 1 5 8Zm4.29 5H7a4 4 0 0 
                            0-4 4v1a2 2 0 0 0 2 2h6.101A6.979 6.979 0 0 1 9 15c0-.695.101-1.366.29-2Z" 
                            clipRule="evenodd"/>
                    </svg>
                </Link>
                
                <button 
                    className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
                    onClick={() => {
                        console.log('Đăng xuất');
                    }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
}