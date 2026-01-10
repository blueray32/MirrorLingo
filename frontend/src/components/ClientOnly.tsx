import { useState, useEffect, ReactNode } from 'react';

interface ClientOnlyProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Wrapper component that only renders children on the client side.
 * This prevents hydration mismatches for components that use browser-only APIs
 * or have dynamic content that differs between server and client.
 */
export const ClientOnly: React.FC<ClientOnlyProps> = ({ children, fallback = null }) => {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default ClientOnly;
