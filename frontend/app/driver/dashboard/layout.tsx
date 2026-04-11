"use client";
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
    const { role, isAuthenticated, hasAccess } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If not logged in or not an Ambulance role, redirect to login
        if (!isAuthenticated || !hasAccess(['Ambulance', 'Admin'])) {
            router.push('/login');
        }
    }, [isAuthenticated, role, router, hasAccess]);

    return <>{children}</>;
}