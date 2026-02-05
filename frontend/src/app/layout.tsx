import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { FountainProvider } from "@/contexts/FountainContext";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Berez - מצא ברזיות מים',
    description: 'מצא ברזיות מים קרובות, דרג ושתף חוויות',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Berez',
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#0066CC',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="he" dir="rtl">
            <head>
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
            </head>
            <AuthProvider>
                <FountainProvider>
                    <body className={`${inter.className} bg-gray-50 min-h-screen`}>
                        {children}
                    </body>
                </FountainProvider>
            </AuthProvider>
        </html>
    )
}
