'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavigationBar() {
    const pathname = usePathname();
    
    const menuItems = [
        { name: 'Tổng quan', path: '/dashboard' },
        { name: 'Quản lí thể loại', path: '/categories' },
        { name: 'Quản lí series', path: '/series' },
        { name: 'Quản lí phim', path: '/movies' },
        { name: 'Quản lí diễn viên', path: '/actors' },
        { name: 'Quản lí người dùng', path: '/users' },
        { name: 'Cài đặt tài khoản', path: '/settings' },
    ];

    const isActiveLink = (path: string) => {
        return pathname === path;
    };

    return (
        <div className="border-r border-gray-200 h-screen max-w-64 w-64 bg-white shadow-lg flex flex-col">
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-200">
                <img className="w-40 h-auto" src="/Logo.png" alt="Logo"/>
            </div>
            
            {/* Navigation Menu */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link 
                                href={item.path}
                                className={`
                                    block p-3 rounded-lg transition-all duration-200 font-medium
                                    ${isActiveLink(item.path) 
                                        ? 'bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-md' 
                                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700 hover:shadow-sm'
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
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        A
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Admin User</div>
                        <div className="text-xs text-gray-500">admin@example.com</div>
                    </div>
                </div>
                
                <button 
                    className="w-full p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    onClick={() => {
                        // Handle logout logic here
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