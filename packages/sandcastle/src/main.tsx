import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

// 为 GitHub Pages 子路径部署设置 Cesium 静态资源路径
// 依赖 vite.config.ts 的 base 配置
(window as any).CESIUM_BASE_URL = import.meta.env.BASE_URL + 'cesium';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);