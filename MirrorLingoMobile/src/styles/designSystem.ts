export const Theme = {
    colors: {
        primary: '#6366f1', // Indigo
        primaryHover: '#4f46e5',
        secondary: '#ec4899', // Pink
        accent: '#10b981', // Green
        warning: '#f59e0b',
        error: '#ef4444',

        // Backgrounds
        background: '#0f172a', // Deep Navy
        card: 'rgba(30, 41, 59, 0.7)',
        glass: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.1)',

        // Text
        textPrimary: '#f8fafc',
        textSecondary: '#94a3b8',
        textMuted: '#64748b',

        // Chat
        bubbleUser: '#1e293b',
        bubbleTutor: '#6366f1',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
    radius: {
        sm: 8,
        md: 12,
        lg: 16,
        full: 9999,
    },
    typography: {
        fontFamily: 'System', // Inter is preferred but using system for reliability
        weights: {
            regular: '400' as const,
            medium: '500' as const,
            bold: '700' as const,
        },
        sizes: {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 20,
            xl: 24,
            xxl: 32,
        },
    },
};
