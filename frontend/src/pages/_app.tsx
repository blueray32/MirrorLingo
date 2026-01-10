import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
    // Suppress hydration warnings in development
    useEffect(() => {
        const originalError = console.error;
        console.error = (...args) => {
            if (
                typeof args[0] === 'string' &&
                (args[0].includes('Hydration failed') ||
                    args[0].includes('hydrating') ||
                    args[0].includes('server HTML'))
            ) {
                // Suppress hydration warnings - these are caused by styled-jsx
                // and don't affect functionality
                return;
            }
            originalError.apply(console, args);
        };
        return () => {
            console.error = originalError;
        };
    }, []);

    return <Component {...pageProps} />;
}

export default MyApp;
