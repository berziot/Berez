"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
    authRequired?: boolean;
}

interface BottomNavProps {
    activeTab?: 'home' | 'map' | 'profile';
    onTabChange?: (tab: 'home' | 'map' | 'profile') => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user } = useAuth();

    // Determine active tab from pathname if not explicitly set
    const currentTab = activeTab || (
        pathname === '/' ? 'home' :
        pathname.includes('/map') ? 'map' :
        pathname.includes('/profile') || pathname.includes('/login') ? 'profile' :
        'home'
    );

    const handleNavClick = (tab: 'home' | 'map' | 'profile', href: string) => {
        if (onTabChange) {
            onTabChange(tab);
        } else {
            router.push(href);
        }
    };

    const navItems: NavItem[] = [
        {
            id: 'home',
            label: 'בית',
            href: '/',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            ),
        },
        {
            id: 'map',
            label: 'מפה',
            href: '/?view=map',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                    <line x1="8" y1="2" x2="8" y2="18" />
                    <line x1="16" y1="6" x2="16" y2="22" />
                </svg>
            ),
        },
        {
            id: 'profile',
            label: isAuthenticated ? user?.name || 'פרופיל' : 'התחברות',
            href: isAuthenticated ? '/profile' : '/login',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            ),
        },
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id as 'home' | 'map' | 'profile', item.href)}
                    className={`bottom-nav-item ${currentTab === item.id ? 'active' : ''}`}
                    aria-label={item.label}
                    aria-current={currentTab === item.id ? 'page' : undefined}
                >
                    <span className={currentTab === item.id ? 'text-blue-600' : 'text-gray-400'}>
                        {item.icon}
                    </span>
                    <span className="text-xs font-medium truncate max-w-[64px]">
                        {item.label}
                    </span>
                </button>
            ))}
        </nav>
    );
}
