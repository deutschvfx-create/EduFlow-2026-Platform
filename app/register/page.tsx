import { AuthCard } from '@/components/auth/auth-card';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
    return (
        <AuthCard
            title="Create account"
            subtitle="Get started with your free account"
        >
            <RegisterForm />
        </AuthCard>
    );
}
