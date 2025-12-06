/*
 * @Author: Xiaohu.Shen
 * @WeChat: yingnan55
 * @Email: trae@example.com
 * @Version: 1.0.0
 * @Descripttion: xxx
 * @Date: 2025-12-06 11:10:39
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-06 12:55:05
 */
import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { categories, getExamplesByCategory } from '../examples/registry';
import styles from '../pages/ExamplesList.module.css';

const ExampleGrid: React.FC = () => {
  const { categoryId = 'basic' } = useParams();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string>('');
  const [sort, setSort] = useState<'title' | 'level'>('title');

  const list = useMemo(() => {
    const raw = getExamplesByCategory(categoryId);
    const q = query.trim().toLowerCase();
    let f = raw.filter((e) => !q || e.title.toLowerCase().includes(q) || (e.description?.toLowerCase().includes(q)) || (e.tags?.some(t => t.toLowerCase().includes(q))));
    if (tag) f = f.filter((e) => e.tags?.includes(tag));
    const s = [...f].sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title) : (a.level || 'beginner').localeCompare(b.level || 'beginner'));
    return s;
  }, [categoryId, query, tag, sort]);

  const currentCategory = useMemo(() => categories.find(c => c.id === categoryId), [categoryId]);

  return (
    <div className={styles.examplesList}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{currentCategory?.name || '示例'}</h1>
          <p className={styles.description}>选择或搜索右侧案例，点击进入详情运行区。</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
            <input placeholder="搜索案例" value={query} onChange={(e) => setQuery(e.target.value)} />
            <select value={tag} onChange={(e) => setTag(e.target.value)}>
              <option value="">全部标签</option>
              {Array.from(new Set(getExamplesByCategory(categoryId).flatMap(e => e.tags || []))).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as any)}>
              <option value="title">按名称</option>
              <option value="level">按难度</option>
            </select>
          </div>
        </div>

        <div className={styles.category}>
          <div className={styles.examplesGrid}>
            {list.map(ex => (
              <Link key={ex.id} to={`/examples/${categoryId}/${ex.id}`} className={styles.exampleCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{ex.title}</h3>
                  <span className={styles.difficulty}>{ex.level || 'beginner'}</span>
                </div>
                <p className={styles.cardDescription}>{ex.description || '—'}</p>
                <div className={styles.tags}>
                  {(ex.tags || []).map(t => (<span key={t} className={styles.tag}>{t}</span>))}
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.viewExample}>查看示例 →</span>
                </div>
              </Link>
            ))}
            {list.length === 0 && (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔎</div>
                <h3>未找到匹配的案例</h3>
                <p>调整搜索或筛选条件试试。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleGrid;
