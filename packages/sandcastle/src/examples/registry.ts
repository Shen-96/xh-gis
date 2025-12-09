/*
 * @Author: Xiaohu.Shen
 * @WeChat: yingnan55
 * @Email: trae@example.com
 * @Version: 1.0.0
 * @Descripttion: xxx
 * @Date: 2025-12-06 11:10:04
 * @LastEditors: Xiaohu.Shen
 * @LastEditTime: 2025-12-06 12:48:34
 */
export type Category = {
  id: string;
  name: string;
  icon?: string;
};

export type ExampleMeta = {
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  tags?: string[];
  level?: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  importer: () => Promise<{ default: React.ComponentType<any> }>;
};

import categoriesJson from './categories.json';
export const categories: Category[] = categoriesJson as Category[];

import rawExamples from './examples.json';

const importerMap: Record<string, () => Promise<{ default: React.ComponentType<any> }>> = {
  map: () => import('../examples/basic/BasicMapExample'),
  widgets: () => import('../examples/basic/WidgetsExample'),
  drawing: () => import('../examples/basic/DrawingExample'),
  heatmap: () => import('../examples/basic/HeatmapExample'),
  'layer-manager': () => import('../examples/basic/LayerManagerExample'),
  'xg-popup': () => import('../examples/basic/XgPopupExample'),
  'model-fx-binding': () => import('../examples/basic/ModelFxBindingExample'),
  'polyline-effects': () => import('../examples/basic/PolylineEffectsExample'),
  'camera-bookmarks': () => import('../examples/basic/CameraBookmarksExample'),
  'tetrahedron-fx': () => import('../examples/basic/TetrahedronFxExample'),
};

export const examples: ExampleMeta[] = (rawExamples as any[]).map((e) => ({
  ...e,
  importer: importerMap[e.id],
}));

export function getExamplesByCategory(categoryId: string) {
  return examples.filter((e) => e.categoryId === categoryId);
}

export function getExample(categoryId: string, exampleId: string) {
  return examples.find((e) => e.categoryId === categoryId && e.id === exampleId);
}
