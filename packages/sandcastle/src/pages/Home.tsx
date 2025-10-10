import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const Home: React.FC = () => {
  const features = [
    {
      icon: '🎯',
      title: '示例展示',
      description: '浏览各种XH-GIS功能的实际应用示例，从基础到高级功能',
      link: '/examples',
      color: '#3b82f6'
    },
    {
      icon: '🧪',
      title: '功能测试',
      description: '运行自动化测试套件，验证engine和widgets包的功能',
      link: '/testing',
      color: '#10b981'
    },
    {
      icon: '📚',
      title: 'API文档',
      description: '查看详细的API文档和使用指南',
      link: '/docs',
      color: '#8b5cf6'
    },
    {
      icon: '🚀',
      title: '快速开始',
      description: '学习如何在你的项目中集成和使用XH-GIS',
      link: '/getting-started',
      color: '#f59e0b'
    }
  ];

  return (
    <div className={styles.home}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            欢迎来到 <span className={styles.highlight}>XH-GIS Sandcastle</span>
          </h1>
          <p className={styles.heroDescription}>
            XH-GIS的示例展示和测试平台，探索强大的地理信息系统功能
          </p>
          <div className={styles.heroActions}>
            <Link to="/examples" className={styles.primaryButton}>
              查看示例 🎯
            </Link>
            <Link to="/testing" className={styles.secondaryButton}>
              运行测试 🧪
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.featuresTitle}>功能特性</h2>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className={styles.featureCard}
                style={{ '--accent-color': feature.color } as React.CSSProperties}
              >
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>20+</div>
              <div className={styles.statLabel}>示例项目</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>100+</div>
              <div className={styles.statLabel}>测试用例</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>2</div>
              <div className={styles.statLabel}>核心包</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>TypeScript</div>
              <div className={styles.statLabel}>类型安全</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;