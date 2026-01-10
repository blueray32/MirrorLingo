import React from 'react';
import Navigation from './Navigation';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: 'home' | 'conversation' | 'tutor' | 'analytics';
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage }) => {
  return (
    <div className={styles.layoutRoot}>
      <div className="animated-bg" />
      <Navigation currentPage={currentPage} />
      <main className={`${styles.mainContainer} fade-in`}>
        {children}
      </main>
      <footer className={styles.footer}>
        <p>© 2026 MirrorLingo - Master your own Spanish</p>
      </footer>
    </div>
  );
};

export default Layout;
