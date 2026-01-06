import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Layout.module.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { path: "/", label: "首页", icon: "🏠" },
    { path: "/examples", label: "示例展示", icon: "🎯" },
    { path: "/testing", label: "功能测试", icon: "🧪" },
    {
      path: (import.meta as any).env.BASE_URL + "ref-doc/",
      label: "API 文档",
      icon: "📚",
      external: true,
    },
  ] as Array<{ path: string; label: string; icon: string; external?: boolean }>;

  // 主题模式：auto | light | dark，默认 auto 跟随系统
  const [themeMode, setThemeMode] = useState<"auto" | "light" | "dark">(() => {
    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem("sandcastle-theme")
        : null;
    return saved === "light" || saved === "dark"
      ? (saved as "light" | "dark")
      : "auto";
  });

  const applyTheme = useMemo(
    () => (mode: "auto" | "light" | "dark") => {
      const root = document.documentElement;
      if (mode === "auto") {
        // 跟随系统：根据 prefers-color-scheme 设置 data-theme
        const isDark =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (isDark) {
          root.setAttribute("data-theme", "dark");
        } else {
          root.removeAttribute("data-theme");
        }
      } else {
        root.setAttribute("data-theme", mode);
      }
    },
    []
  );

  useEffect(() => {
    applyTheme(themeMode);
    try {
      window.localStorage.setItem("sandcastle-theme", themeMode);
    } catch (error) {
      console.error("设置主题失败:", error);
    }
    // 在自动模式下监听系统主题变化
    if (themeMode === "auto" && window.matchMedia) {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("auto");
      media.addEventListener?.("change", handler);
      // 兼容旧浏览器
      media.addListener?.(handler);
      return () => {
        media.removeEventListener?.("change", handler);
        media.removeListener?.(handler);
      };
    }
  }, [themeMode, applyTheme]);

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>🌍</span>
            <span className={styles.logoText}>XH-GIS Sandcastle</span>
          </Link>
          <div className={styles.controls}>
            <nav className={styles.nav}>
              {navigation.map((item) =>
                item.external ? (
                  <a
                    key={item.path}
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.navLink}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${styles.navLink} ${
                      location.pathname === item.path
                        ? styles.navLinkActive
                        : ""
                    }`}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              )}
            </nav>
            <label className={styles.themeToggle}>
              <span className={styles.themeLabel}>主题</span>
              <select
                aria-label="主题模式"
                className={styles.themeSelect}
                value={themeMode}
                onChange={(e) =>
                  setThemeMode(e.target.value as "auto" | "light" | "dark")
                }
              >
                <option value="auto">自动</option>
                <option value="light">浅色</option>
                <option value="dark">暗色</option>
              </select>
            </label>
          </div>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>&copy; 2024 XH-GIS Team. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <a
              href="https://github.com/Shen-96/xh-gis"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://github.com/Shen-96/xh-gis/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              Issues
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
