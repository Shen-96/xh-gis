import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

const NotFound: React.FC = () => {
  return (
    <div className={styles.notFound}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.icon}>🔍</div>
          <h1 className={styles.title}>页面未找到</h1>
          <p className={styles.description}>
            抱歉，您访问的页面不存在。可能是链接错误或页面已被移动。
          </p>
          <div className={styles.actions}>
            <Link to="/" className={styles.homeButton}>
              回到首页 🏠
            </Link>
            <Link to="/examples" className={styles.examplesButton}>
              查看示例 🎯
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;