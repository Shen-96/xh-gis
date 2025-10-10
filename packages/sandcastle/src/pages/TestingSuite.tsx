import React, { useState, useCallback } from 'react';
import styles from './TestingSuite.module.css';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
}

const TestingSuite: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: 'Engine - 地图初始化', status: 'pending' },
    { name: 'Engine - 相机控制', status: 'pending' },
    { name: 'Engine - 几何绘制', status: 'pending' },
    { name: 'Widgets - 组件渲染', status: 'pending' },
    { name: 'Widgets - 事件处理', status: 'pending' },
    { name: 'Integration - 完整流程', status: 'pending' },
  ]);
  
  const [isRunning, setIsRunning] = useState(false);

  const runTests = useCallback(async () => {
    setIsRunning(true);
    
    // 模拟测试运行
    for (let i = 0; i < testResults.length; i++) {
      setTestResults(prev => prev.map((test, index) => 
        index === i ? { ...test, status: 'running' } : test
      ));
      
      // 模拟测试执行时间
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // 模拟测试结果（大部分通过，偶尔失败）
      const passed = Math.random() > 0.2;
      const duration = Math.floor(100 + Math.random() * 500);
      
      setTestResults(prev => prev.map((test, index) => 
        index === i ? { 
          ...test, 
          status: passed ? 'passed' : 'failed',
          duration,
          error: passed ? undefined : '模拟测试错误：功能暂未实现'
        } : test
      ));
    }
    
    setIsRunning(false);
  }, [testResults.length]);

  const resetTests = useCallback(() => {
    setTestResults(prev => prev.map(test => ({
      ...test,
      status: 'pending',
      duration: undefined,
      error: undefined
    })));
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'passed': return '✅';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '#64748b';
      case 'running': return '#3b82f6';
      case 'passed': return '#10b981';
      case 'failed': return '#ef4444';
      default: return '#64748b';
    }
  };

  const passedCount = testResults.filter(t => t.status === 'passed').length;
  const failedCount = testResults.filter(t => t.status === 'failed').length;
  const totalCount = testResults.length;

  return (
    <div className={styles.testingSuite}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>功能测试套件</h1>
          <p className={styles.description}>
            自动化测试XH-GIS Engine和Widgets的核心功能，确保代码质量和功能稳定性
          </p>
        </div>

        <div className={styles.controls}>
          <button 
            onClick={runTests} 
            disabled={isRunning}
            className={styles.runButton}
          >
            {isRunning ? '运行中...' : '运行测试'} 🧪
          </button>
          <button 
            onClick={resetTests} 
            disabled={isRunning}
            className={styles.resetButton}
          >
            重置 🔄
          </button>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryNumber}>{totalCount}</div>
            <div className={styles.summaryLabel}>总测试</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryNumber} style={{ color: '#10b981' }}>
              {passedCount}
            </div>
            <div className={styles.summaryLabel}>通过</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryNumber} style={{ color: '#ef4444' }}>
              {failedCount}
            </div>
            <div className={styles.summaryLabel}>失败</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryNumber}>
              {totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0}%
            </div>
            <div className={styles.summaryLabel}>通过率</div>
          </div>
        </div>

        <div className={styles.testsList}>
          {testResults.map((test, index) => (
            <div 
              key={index} 
              className={styles.testItem}
              style={{ borderLeftColor: getStatusColor(test.status) }}
            >
              <div className={styles.testHeader}>
                <span className={styles.testIcon}>
                  {getStatusIcon(test.status)}
                </span>
                <span className={styles.testName}>{test.name}</span>
                {test.duration && (
                  <span className={styles.testDuration}>
                    {test.duration}ms
                  </span>
                )}
              </div>
              
              {test.error && (
                <div className={styles.testError}>
                  <code>{test.error}</code>
                </div>
              )}
              
              {test.status === 'running' && (
                <div className={styles.testProgress}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill}></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.info}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>📊 测试覆盖</h3>
            <ul className={styles.coverageList}>
              <li>🎯 Engine包核心功能</li>
              <li>🎨 Widgets组件渲染</li>
              <li>🔗 模块间集成测试</li>
              <li>⚡ 性能基准测试</li>
            </ul>
          </div>

          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>🛠️ 测试工具</h3>
            <div className={styles.toolsList}>
              <span className={styles.tool}>Jest</span>
              <span className={styles.tool}>React Testing Library</span>
              <span className={styles.tool}>TypeScript</span>
              <span className={styles.tool}>Coverage Reports</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestingSuite;