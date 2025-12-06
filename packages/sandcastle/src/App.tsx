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
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import ExamplesList from './pages/ExamplesList';
import TestingSuite from './pages/TestingSuite';
import NotFound from './pages/NotFound';

// 导入示例页面
import BasicMapExample from './examples/basic/BasicMapExample';
import DrawingExample from './examples/basic/DrawingExample';
import WidgetsExample from './examples/basic/WidgetsExample';
import HeatmapExample from './examples/basic/HeatmapExample';
import LayerManagerExample from './examples/basic/LayerManagerExample';
import XgPopupExample from './examples/basic/XgPopupExample';
import ModelFxBindingExample from './examples/basic/ModelFxBindingExample';
import PolylineEffectsExample from './examples/basic/PolylineEffectsExample';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/examples" element={<ExamplesList />} />
        <Route path="/testing" element={<TestingSuite />} />
        
        {/* 基础示例 */}
        <Route path="/examples/basic/map" element={<BasicMapExample />} />
        <Route path="/examples/basic/drawing" element={<DrawingExample />} />
        <Route path="/examples/basic/widgets" element={<WidgetsExample />} />
        <Route path="/examples/basic/heatmap/*" element={<HeatmapExample />} />
        <Route path="/examples/basic/layer-manager" element={<LayerManagerExample />} />
        <Route path="/examples/basic/xg-popup" element={<XgPopupExample />} />
        <Route path="/examples/basic/model-fx-binding" element={<ModelFxBindingExample />} />
        <Route path="/examples/basic/polyline-effects" element={<PolylineEffectsExample />} />
        
        {/* 404页面 */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
};

export default App;