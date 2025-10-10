# XH-GIS Sandcastle

XH-GIS Sandcastle 是一个示例展示和测试平台，用于演示 XH-GIS Engine 和 Widgets 的各种功能和应用场景。

## 🎯 功能特性

### 📖 示例展示
- **基础示例**: 地图初始化、图形绘制、UI组件等基础功能
- **高级示例**: 复杂交互、空间分析、动态效果等高级功能  
- **集成示例**: 完整应用场景的端到端演示

### 🧪 功能测试
- **自动化测试**: Engine 和 Widgets 核心功能的自动化测试
- **性能测试**: 渲染性能、内存使用等性能基准测试
- **集成测试**: 模块间协作的集成测试

### 🎨 交互界面
- **现代化UI**: 基于 React + TypeScript 的现代化界面
- **响应式设计**: 支持桌面和移动设备
- **代码展示**: 每个示例都包含相应的代码演示

## 🚀 快速开始

### 安装依赖

```bash
# 在项目根目录
pnpm install
```

### 启动开发服务器

```bash
# 启动 Sandcastle 开发服务器
cd packages/sandcastle
pnpm dev
```

访问 `http://localhost:3000` 查看示例和测试平台。

### 构建

```bash
# 构建 Sandcastle
cd packages/sandcastle
pnpm build
```

## 📁 项目结构

```
packages/sandcastle/
├── src/
│   ├── components/          # 公共组件
│   │   └── Layout.tsx       # 布局组件
│   ├── pages/               # 页面组件
│   │   ├── Home.tsx         # 首页
│   │   ├── ExamplesList.tsx # 示例列表
│   │   ├── TestingSuite.tsx # 测试套件
│   │   └── NotFound.tsx     # 404页面
│   ├── examples/            # 示例演示
│   │   ├── basic/           # 基础示例
│   │   ├── advanced/        # 高级示例 (计划中)
│   │   └── integration/     # 集成示例 (计划中)
│   ├── tests/               # 测试文件
│   ├── styles/              # 样式文件
│   └── utils/               # 工具函数
├── public/                  # 静态资源
├── package.json             # 包配置
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
└── jest.config.js          # Jest测试配置
```

## 🎯 示例类别

### 基础示例 (Basic Examples)

1. **基础地图** (`/examples/basic/map`)
   - 3D地球初始化
   - 相机控制
   - 基础交互

2. **图形绘制** (`/examples/basic/drawing`)
   - 点、线、面绘制
   - 图形编辑
   - 样式设置

3. **UI组件** (`/examples/basic/widgets`)
   - 工具栏组件
   - 时间轴组件
   - 弹窗组件

### 高级示例 (Advanced Examples) - 计划中

- 空间分析
- 动态材质
- 时间动画
- 天气模拟

### 集成示例 (Integration Examples) - 计划中

- 完整GIS应用
- 数据可视化
- 实时监控

## 🧪 测试套件

Sandcastle 包含完整的测试套件：

```bash
# 运行所有测试
pnpm test

# 监视模式运行测试
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

### 测试覆盖范围

- **Engine包测试**: 地图引擎核心功能
- **Widgets包测试**: React组件渲染和交互
- **集成测试**: 模块间协作功能
- **性能测试**: 渲染性能和内存使用

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **测试框架**: Jest + React Testing Library
- **路由**: React Router v6
- **样式**: CSS Modules
- **包管理**: pnpm

## 📝 贡献指南

### 添加新示例

1. 在对应目录创建示例组件 (`src/examples/{category}/{ExampleName}.tsx`)
2. 添加路由配置 (`src/App.tsx`)
3. 更新示例列表 (`src/pages/ExamplesList.tsx`)
4. 编写相应的测试用例

### 添加测试用例

1. 在 `src/tests/` 目录创建测试文件
2. 使用 Jest + React Testing Library 编写测试
3. 确保测试覆盖率达到要求

## 🔗 相关链接

- [XH-GIS Engine 文档](../engine/README.md)
- [XH-GIS Widgets 文档](../widgets/README.md)
- [项目主页](../../README.md)

## 📄 许可证

MIT License - 详见 [LICENSE](../../LICENSE) 文件。