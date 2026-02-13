import { ReactNode } from 'react';

interface AuthCardProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
            <div className="w-full max-w-[380px] bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                    )}
                </div>
                {children}
            </div>
        </div>
    );
}
