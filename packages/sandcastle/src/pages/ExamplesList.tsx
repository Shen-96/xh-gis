import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ExamplesList.module.css';

interface Example {
  id: string;
  title: string;
  description: string;
  category: 'basic' | 'advanced' | 'integration';
  path: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

const ExamplesList: React.FC = () => {
  const examples: Example[] = [
    {
      id: 'basic-map',
      title: '基础地图',
      description: '创建一个基本的3D地球，展示XH-GIS Engine的核心功能',
      category: 'basic',
      path: '/examples/basic/map',
      difficulty: 'beginner',
      tags: ['地图', '3D', '基础']
    },
    {
      id: 'drawing',
      title: '图形绘制',
      description: '演示点、线、面等几何图形的绘制功能',
      category: 'basic',
      path: '/examples/basic/drawing',
      difficulty: 'beginner',
      tags: ['绘制', '几何', '交互']
    },
    {
      id: 'widgets',
      title: 'UI组件',
      description: '展示XH-GIS Widgets包中的各种React组件',
      category: 'basic',
      path: '/examples/basic/widgets',
      difficulty: 'beginner',
      tags: ['组件', 'UI', 'React']
    },
    {
      id: 'layer-manager',
      title: '图层管理',
      description: '演示 LayerManager 添加底图组合与配置图层',
      category: 'basic',
      path: '/examples/basic/layer-manager',
      difficulty: 'beginner',
      tags: ['图层', '底图', '配置']
    },
    {
      id: 'heatmap',
      title: '热度图',
      description: '演示基于 Cesium 的热度图渲染与等值线',
      category: 'basic',
      path: '/examples/basic/heatmap',
      difficulty: 'beginner',
      tags: ['热力图', '分析', 'Cesium']
    }
    ,
    {
      id: 'xg-popup',
      title: '弹窗（XgPopup）',
      description: '展示 XgPopup 在字符串、DOM、React 三种内容形态下的使用',
      category: 'basic',
      path: '/examples/basic/xg-popup',
      difficulty: 'beginner',
      tags: ['弹窗', '交互', 'UI']
    }
  ];

  const categories = {
    basic: { name: '基础示例', icon: '🎯', color: '#3b82f6' },
    advanced: { name: '高级示例', icon: '🚀', color: '#8b5cf6' },
    integration: { name: '集成示例', icon: '🔗', color: '#10b981' }
  };

  const difficulties = {
    beginner: { name: '初级', color: '#10b981' },
    intermediate: { name: '中级', color: '#f59e0b' },
    advanced: { name: '高级', color: '#ef4444' }
  };

  const groupedExamples = examples.reduce((acc, example) => {
    if (!acc[example.category]) {
      acc[example.category] = [];
    }
    acc[example.category].push(example);
    return acc;
  }, {} as Record<string, Example[]>);

  return (
    <div className={styles.examplesList}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>示例展示</h1>
          <p className={styles.description}>
            探索XH-GIS的各种功能和应用场景，从基础的地图显示到复杂的空间分析
          </p>
        </div>

        {Object.entries(groupedExamples).map(([category, categoryExamples]) => {
          const categoryInfo = categories[category as keyof typeof categories];
          
          return (
            <section key={category} className={styles.category}>
              <div className={styles.categoryHeader}>
                <span 
                  className={styles.categoryIcon}
                  style={{ color: categoryInfo.color }}
                >
                  {categoryInfo.icon}
                </span>
                <h2 className={styles.categoryTitle}>{categoryInfo.name}</h2>
                <div className={styles.categoryCount}>
                  {categoryExamples.length} 个示例
                </div>
              </div>

              <div className={styles.examplesGrid}>
                {categoryExamples.map((example) => (
                  <Link
                    key={example.id}
                    to={example.path}
                    className={styles.exampleCard}
                  >
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{example.title}</h3>
                      <span 
                        className={styles.difficulty}
                        style={{ 
                          color: difficulties[example.difficulty].color,
                          borderColor: difficulties[example.difficulty].color
                        }}
                      >
                        {difficulties[example.difficulty].name}
                      </span>
                    </div>
                    
                    <p className={styles.cardDescription}>
                      {example.description}
                    </p>
                    
                    <div className={styles.tags}>
                      {example.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    
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

        {Object.keys(groupedExamples).length === 0 && (
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