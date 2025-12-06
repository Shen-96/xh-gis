import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ExamplesList.module.css';
import { categories as registryCategories, getExamplesByCategory } from '../examples/registry';

const ExamplesList: React.FC = () => {
  const [filter, setFilter] = useState('');
  const [highlightSection, setHighlightSection] = useState<string | null>(null);
  const [highlightExample, setHighlightExample] = useState<string | null>(null);

  useEffect(() => {
    const applyFromHash = () => {
      const hash = window.location.hash || '';
      if (!hash) return;
      const header = document.querySelector('header') as HTMLElement | null;
      const filters = document.getElementById('examples-filters') as HTMLElement | null;
      const base = (header?.offsetHeight || 0) + (filters?.offsetHeight || 0) + 16;
      const isMobile = window.innerWidth <= 768;
      const offset = isMobile ? base - 24 : base;
      if (hash.startsWith('#section-')) {
        const id = hash.replace('#section-', '');
        setHighlightSection(id);
        const el = document.getElementById(`section-${id}`);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        setTimeout(() => setHighlightSection(null), 1200);
      } else if (hash.startsWith('#example-')) {
        const rest = hash.replace('#example-', '');
        const parts = rest.split('-');
        const catId = parts[0];
        const exId = parts.slice(1).join('-');
        setHighlightSection(catId);
        setHighlightExample(`${catId}-${exId}`);
        const el = document.getElementById(`example-${catId}-${exId}`);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        setTimeout(() => setHighlightExample(null), 1200);
        setTimeout(() => setHighlightSection(null), 1200);
      }
    };
    applyFromHash();
    const handler = () => applyFromHash();
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const difficulties = {
    beginner: { name: '初级', color: '#10b981' },
    intermediate: { name: '中级', color: '#f59e0b' },
    advanced: { name: '高级', color: '#ef4444' }
  } as const;

  const filteredCategories = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return registryCategories.map((cat) => ({ ...cat, list: getExamplesByCategory(cat.id) }));
    return registryCategories
      .map((cat) => ({ ...cat, list: getExamplesByCategory(cat.id).filter((ex) => {
        const text = `${ex.title} ${ex.description || ''} ${(ex.tags || []).join(' ')}`.toLowerCase();
        return text.includes(q);
      }) }))
      .filter((cat) => cat.list.length > 0);
  }, [filter]);

  return (
    <div className={styles.examplesList}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>示例展示</h1>
          <p className={styles.description}>
            探索XH-GIS的各种功能和应用场景，从基础的地图显示到复杂的空间分析
          </p>
        </div>

        <div id="examples-filters" className={styles.filters}>
          <input
            className={styles.filterInput}
            placeholder="搜索示例或标签"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {filteredCategories.map((cat) => {
          const list = (cat as any).list as ReturnType<typeof getExamplesByCategory>;
          return (
            <section
              key={cat.id}
              id={`section-${cat.id}`}
              className={styles.category}
              data-highlight={highlightSection === cat.id}
            >
              <div className={styles.categoryHeader}>
                <span 
                  className={styles.categoryIcon}
                  style={{ color: '#3b82f6' }}
                >
                  {cat.icon || '📁'}
                </span>
                <h2 className={styles.categoryTitle}>{cat.name}</h2>
                <div className={styles.categoryCount}>
                  {list.length} 个示例
                </div>
              </div>

              <div className={styles.examplesGrid}>
                {list.map((ex) => (
                  <Link
                    key={ex.id}
                    id={`example-${cat.id}-${ex.id}`}
                    to={`/examples/${cat.id}/${ex.id}`}
                    className={styles.exampleCard}
                    data-highlight={highlightExample === `${cat.id}-${ex.id}`}
                  >
                    <div className={styles.thumb}>
                      <img
                        className={styles.thumbImg}
                        src={(ex.thumbnail && import.meta.env.BASE_URL + ex.thumbnail) || (import.meta.env.BASE_URL + 'xh-gis/Assets/Maps/globe_1.png')}
                        alt={ex.title}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const base = import.meta.env.BASE_URL + 'xh-gis/Assets/Maps/globe_1.png';
                          target.src = `${base}?v=${Date.now()}`;
                        }}
                      />
                    </div>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{ex.title}</h3>
                      {ex.level && (
                        <span 
                          className={styles.difficulty}
                          style={{ 
                            color: difficulties[ex.level].color,
                            borderColor: difficulties[ex.level].color
                          }}
                        >
                          {difficulties[ex.level].name}
                        </span>
                      )}
                    </div>
                    {ex.description && (
                      <p className={styles.cardDescription}>
                        {ex.description}
                      </p>
                    )}
                    {ex.tags && ex.tags.length > 0 && (
                      <div className={styles.tags}>
                        {ex.tags.map((tag) => (
                          <span key={tag} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className={styles.cardFooter}>
                      <span className={styles.viewExample}>
                        查看示例 →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📝</div>
            <h3>示例正在开发中</h3>
            <p>更多精彩示例即将上线，敬请期待！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamplesList;
