import React from 'react';
import Link from 'next/link';
import styles from './Navigation.module.css';

interface NavigationProps {
  currentPage?: 'home' | 'conversation' | 'tutor' | 'analytics';
  isListening?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage = 'home', isListening }) => {
  return (
    <nav className={styles.mainNav}>
      <Link href="/" className={styles.navLogo}>
        <span className={styles.logoText}>MirrorLingo</span>
        {isListening && <div className={styles.listeningDot} title="Live Listening Active" />}
      </Link>

      <div className={styles.navLinks}>
        <Link
          href="/"
          className={`${styles.navLink} ${currentPage === 'home' ? styles.navLinkActive : ''}`}
        >
          <span className={styles.navIcon}>🏠</span>
          <span className={styles.navLabel}>Home</span>
        </Link>
        <Link
          href="/analytics"
          className={`${styles.navLink} ${currentPage === 'analytics' ? styles.navLinkActive : ''}`}
        >
          <span className={styles.navIcon}>📊</span>
          <span className={styles.navLabel}>Analytics</span>
        </Link>
        <Link
          href="/ai-conversation"
          className={`${styles.navLink} ${currentPage === 'conversation' ? styles.navLinkActive : ''}`}
        >
          <span className={styles.navIcon}>🗣️</span>
          <span className={styles.navLabel}>Conversation</span>
        </Link>
        <Link
          href="/tutor"
          className={`${styles.navLink} ${currentPage === 'tutor' ? styles.navLinkActive : ''}`}
        >
          <span className={styles.navIcon}>🎓</span>
          <span className={styles.navLabel}>Tutor</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
