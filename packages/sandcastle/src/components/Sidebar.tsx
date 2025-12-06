import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { categories, getExamplesByCategory } from '../examples/registry';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [query, setQuery] = useState('');

  const activeCategory = useMemo(() => {
    const hash = location.hash || '';
    if (hash.startsWith('#section-')) return hash.replace('#section-', '');
    if (hash.startsWith('#example-')) {
      const rest = hash.replace('#example-', '');
      const segs = rest.split('-');
      return segs[0] || 'basic';
    }
    return 'basic';
  }, [location.hash]);

  const activeExampleId = useMemo(() => {
    const hash = location.hash || '';
    if (hash.startsWith('#example-')) {
      const rest = hash.replace('#example-', '');
      const segs = rest.split('-');
      return segs.slice(1).join('-');
    }
    return '';
  }, [location.hash]);

  const getScrollOffset = () => {
    const header = document.querySelector('header') as HTMLElement | null;
    const filters = document.getElementById('examples-filters') as HTMLElement | null;
    const base = (header?.offsetHeight || 0) + (filters?.offsetHeight || 0) + 16;
    const isMobile = window.innerWidth <= 768;
    return isMobile ? base - 24 : base;
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      const offset = getScrollOffset();
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      window.location.hash = `section-${id}`;
    }
  };

  const scrollToExample = (catId: string, exId: string) => {
    const el = document.getElementById(`example-${catId}-${exId}`);
    if (el) {
      const offset = getScrollOffset();
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      window.location.hash = `example-${catId}-${exId}`;
    }
  };

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q) || c.id.includes(q));
  }, [query]);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.searchBar}>
        <input
          placeholder="搜索分类"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <nav className={styles.navTree}>
        {filteredCategories.map((c) => {
          const isActive = c.id === activeCategory;
          const examples = getExamplesByCategory(c.id);
          return (
            <div key={c.id} className={styles.category}>
              <a
                href={`#section-${c.id}`}
                className={`${styles.categoryItem} ${isActive ? styles.active : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(c.id);
                }}
              >
                <span className={styles.icon}>{c.icon || '📁'}</span>
                <span className={styles.name}>{c.name}</span>
                <span className={styles.count}>{examples.length}</span>
              </a>
              {isActive && (
                <div className={styles.examples}>
                  {examples.map((ex) => (
                    <a
                      key={ex.id}
                      href={`#example-${c.id}-${ex.id}`}
                      className={`${styles.exampleItem} ${activeExampleId === ex.id ? styles.exampleActive : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToExample(c.id, ex.id);
                      }}
                    >
                      <span className={styles.exampleTitle}>{ex.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
