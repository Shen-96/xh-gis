/*
 * @Descripttion: xxx
 * @Author: Xiaohu.Shen
 * @Wechat: yingnan55
 * @Email: tigerk96@outlook.com
 * @Date: 2025-10-10 14:53:03
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-05 14:33:57
 */
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import ExamplesList from './pages/ExamplesList';
import Sidebar from './components/Sidebar';
import ExampleDetail from './pages/ExampleDetail';
import TestingSuite from './pages/TestingSuite';
import NotFound from './pages/NotFound';

// 统一使用 ExampleDetail 动态路由，不再静态导入示例页面

const App: React.FC = () => {
  const location = useLocation();
  const isExamplesList = location.pathname === '/examples';
  return (
    <ErrorBoundary>
      <Layout>
        {isExamplesList ? (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr' }}>
            <Sidebar />
            <div>
              <Routes>
                <Route path="/examples" element={<ExamplesList />} />
              </Routes>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            {/* 示例详情页（不显示左侧 Sidebar） */}
            <Route path="/examples/:categoryId/:exampleId" element={<ExampleDetail />} />
            {/* 旧示例路由已移除，统一由 ExampleDetail 按注册表加载 */}
            <Route path="/testing" element={<TestingSuite />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </Layout>
    </ErrorBoundary>
  );
};

export default App;
