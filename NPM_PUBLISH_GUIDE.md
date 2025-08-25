# XH-GIS NPM 发布指南

## 📦 包结构总览

xh-gis 项目已成功配置为类似 CesiumJS 的三包发布模式：

```
xh-gis/
├── packages/
│   ├── engine/           # @xh-gis/engine - 核心引擎
│   └── widgets/          # @xh-gis/widgets - React组件
└── (root)               # xh-gis - 统一导入包
```

## 🎯 三个 NPM 包

### 1. `@xh-gis/engine`
- **功能**: 核心 GIS 引擎，基于 CesiumJS
- **主要内容**: XgEarth, XgMap, 各种管理器类
- **构建方式**: Rollup + TypeScript
- **输出格式**: ESM 模块

### 2. `@xh-gis/widgets`  
- **功能**: React 组件库
- **主要内容**: Earth, Map React 组件
- **依赖**: @xh-gis/engine
- **构建方式**: TypeScript

### 3. `xh-gis`
- **功能**: 统一导入包，包含前两个包的所有功能
- **依赖**: @xh-gis/engine + @xh-gis/widgets
- **使用场景**: 一键安装所有功能

## 🚀 发布流程

### 第一次发布

1. **登录 NPM**
   ```bash
   npm login
   ```

2. **检查构建**
   ```bash
   ./test.sh
   ```

3. **发布所有包**
   ```bash
   ./publish.sh
   ```

### 后续版本发布

1. **更新版本号**
   ```bash
   ./version.sh 1.0.1
   ```

2. **重新构建**
   ```bash
   pnpm install
   pnpm run build:packages
   pnpm run build
   ```

3. **发布**
   ```bash
   ./publish.sh
   ```

## 📋 发布前检查清单

- [ ] 所有代码已提交到 Git
- [ ] 版本号已更新
- [ ] 构建成功无错误
- [ ] 测试脚本通过
- [ ] README 文档完整
- [ ] LICENSE 文件存在

## 🎭 使用方式对比

### 方式一：完整包（推荐新用户）
```bash
npm install xh-gis
```
```typescript
import { XgEarth, Earth } from 'xh-gis';
```

### 方式二：按需安装（推荐有经验用户）
```bash
npm install @xh-gis/engine @xh-gis/widgets
```
```typescript
import { XgEarth } from '@xh-gis/engine';
import { Earth } from '@xh-gis/widgets';
```

### 方式三：仅引擎（推荐高级用户）
```bash
npm install @xh-gis/engine
```
```typescript
import { XgEarth } from '@xh-gis/engine';
```

## 🔧 技术实现细节

### Workspace 配置
- 使用 pnpm workspace 管理 monorepo
- 开发时使用 `workspace:^1.0.0` 依赖
- 发布时自动转换为正常的 npm 依赖

### 构建配置
- **Engine**: Rollup 构建，支持资源处理
- **Widgets**: TypeScript 编译，生成 ESM 模块
- **Root**: TypeScript 编译，纯导出模块

### 自动化脚本
- `test.sh`: 验证构建结果
- `version.sh`: 统一更新版本号
- `publish.sh`: 自动发布所有包

## 📊 包大小和依赖

### @xh-gis/engine
- **Peer Dependencies**: cesium@1.108.0, react@^18.3.1
- **Size**: ~1MB (不含 Cesium)

### @xh-gis/widgets
- **Dependencies**: @xh-gis/engine
- **Peer Dependencies**: react@>=16.8.0
- **Size**: ~50KB

### xh-gis
- **Dependencies**: @xh-gis/engine + @xh-gis/widgets
- **Size**: 包装包，不增加额外大小

## 🌐 CDN 使用

发布后，用户也可以通过 CDN 使用：

```html
<!-- 使用 unpkg -->
<script src="https://unpkg.com/xh-gis@latest/dist/index.js"></script>

<!-- 使用 jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/xh-gis@latest/dist/index.js"></script>
```

## 🔮 未来计划

1. **扩展 Widgets 包**: 恢复并修复更多 UI 组件
2. **文档网站**: 建立在线文档和示例
3. **类型定义**: 完善 TypeScript 类型定义
4. **单元测试**: 添加测试覆盖
5. **CI/CD**: 自动化构建和发布流程

## 🆘 故障排除

### 发布失败
- 检查 npm 登录状态
- 确认包名是否被占用
- 检查网络连接

### 构建错误
- 运行 `pnpm install` 重新安装依赖
- 检查 TypeScript 配置
- 查看具体错误信息

### 版本冲突
- 确保所有包版本号一致
- 检查 workspace 依赖配置

## 📞 获取帮助

如果遇到问题，可以：
1. 检查项目 README 文档
2. 查看示例代码 (EXAMPLES.md)
3. 提交 GitHub Issue
4. 联系维护者

---

🎉 恭喜！XH-GIS 项目已成功配置为三包发布模式，可以开始发布到 NPM 了！