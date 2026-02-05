"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    const handleLogout = () => {
        if (window.confirm('האם אתה בטוח שברצונך להתנתק?')) {
            logout();
            router.push('/');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
            {/* Header */}
            <header className="bg-white border-b border-gray-100">
                <div className="px-4 py-3 flex items-center justify-between">
                    <h1 className="text-lg font-bold text-gray-900">פרופיל</h1>
                    <button
                        onClick={() => router.back()}
                        className="text-blue-600"
                    >
                        חזרה
                    </button>
                </div>
            </header>

            {/* Profile content */}
            <main className="p-4 space-y-4">
                {/* User info card */}
                <div className="card">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-2xl font-bold text-blue-600">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                            <p className="text-gray-500">@{user.username}</p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm text-gray-500">
                            נרשמת ב-{new Date(user.created_at).toLocaleDateString('he-IL')}
                        </p>
                    </div>
                </div>

                {/* Stats card - placeholder for future */}
                <div className="card">
                    <h3 className="font-bold text-gray-900 mb-3">הפעילות שלי</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">-</p>
                            <p className="text-sm text-gray-500">ביקורות</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">-</p>
                            <p className="text-sm text-gray-500">תמונות</p>
                        </div>
                    </div>
                </div>

                {/* Settings */}
                <div className="card">
                    <h3 className="font-bold text-gray-900 mb-3">הגדרות</h3>
                    <div className="space-y-2">
                        <button
                            onClick={handleLogout}
                            className="w-full text-right py-3 px-4 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
                        >
                            התנתקות
                        </button>
                    </div>
                </div>

                {/* App info */}
                <div className="text-center text-sm text-gray-400 pt-4">
                    <p>Berez v1.0.0</p>
                    <p className="mt-1">מצא ברזיות מים, דרג ושתף 💧</p>
                </div>
            </main>

            {/* Bottom Navigation */}
            <BottomNav activeTab="profile" />
        </div>
    );
}
