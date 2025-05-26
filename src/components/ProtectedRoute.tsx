import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
    children: JSX.Element;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    return children;
}