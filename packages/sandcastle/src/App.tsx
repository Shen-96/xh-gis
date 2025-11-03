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
        
        {/* 404页面 */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
};

export default App;