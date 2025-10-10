import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/examples', label: '示例展示', icon: '🎯' },
    { path: '/testing', label: '功能测试', icon: '🧪' },
  ];

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>🌍</span>
            <span className={styles.logoText}>XH-GIS Sandcastle</span>
          </Link>
          
          <nav className={styles.nav}>
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navLink} ${
                  location.pathname === item.path ? styles.navLinkActive : ''
                }`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>&copy; 2024 XH-GIS Team. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <a href="https://github.com/Shen-96/xh-gis" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="https://github.com/Shen-96/xh-gis/issues" target="_blank" rel="noopener noreferrer">
              Issues
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;