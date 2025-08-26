# XH-GIS 脚本使用指南

## 📦 脚本概览

项目提供了一套完整的版本管理和发布脚本，支持一键发布功能。

### 🎯 主要脚本

| 脚本文件 | 功能 | 推荐使用 | 适用场景 |
|---------|------|----------|----------|
| `release.sh` | 🚀 **一键发布** (版本管理+构建+发布) | ⭐⭐⭐⭐⭐ | 日常发布、新手使用 |
| `version.sh` | 📝 版本管理 (统一更新版本号) | ⭐⭐⭐⭐ | 团队协作、版本准备 |
| `publish.sh` | 📤 标准发布 (发布到NPM官方源) | ⭐⭐⭐ | 重新发布、标签发布 |
| `publish-cn.sh` | 🇨🇳 国内发布 (国内环境优化) | ⭐⭐⭐ | 国内环境发布 |
| `test.sh` | 🧪 构建验证 | ⭐⭐ | 构建测试 |
| `registry.sh` | 🔄 镜像源管理 | ⭐⭐ | 镜像源切换 |

## 🚀 快速开始

### 📈 推荐使用优先级

1. **🥇 首选：一键发布（release.sh）**
   - **适用场景**: 日常发布、新手使用、追求效率
   - **优势**: 自动化程度最高，包含完整流程
   ```bash
   # 发布补丁版本（最常用）
   ./release.sh patch
   
   # 发布指定版本
   ./release.sh 1.0.1
   
   # 模拟发布（测试）
   ./release.sh patch --dry-run
   
   # 国内环境发布
   ./release.sh patch --china
   ```

2. **🥈 备选：分步操作（version.sh + publish.sh）**
   - **适用场景**: 需要测试验证、团队协作、精确控制
   - **优势**: 灵活性高，可以分阶段执行
   ```bash
   # 场景：想先更新版本，测试后再发布
   ./version.sh patch          # 只更新版本
   # ... 进行测试 ...
   ./publish.sh               # 构建并发布
   ```

3. **🥉 特殊：国内用户直接发布（publish-cn.sh）**
   - **适用场景**: 已手动更新版本，只需发布
   - **优势**: 针对国内环境优化
   ```bash
   # 如果已经手动更新了版本，想直接发布
   ./publish-cn.sh
   ```

### 🎯 推荐使用流程

#### 新手推荐（一键发布）

```bash
# 发布指定版本 (推荐)
./release.sh 1.0.2

# 发布补丁版本 (1.0.1 -> 1.0.2)
./release.sh patch

# 发布次版本 (1.0.1 -> 1.1.0)
./release.sh minor

# 发布主版本 (1.0.1 -> 2.0.0)
./release.sh major
```

#### 经验用户推荐（分步控制）

```bash
# 1. 先更新版本
./version.sh 1.0.2

# 2. 测试构建
./test.sh

# 3. 确认无误后发布
./publish.sh
```

### 📝 模拟运行 (建议先测试)

```bash
# 模拟发布，检查流程
./release.sh 1.0.2 --dry-run

# 模拟补丁版本发布
./release.sh patch --dry-run
```

### 🎆 特殊发布需求

```bash
# 发布 Beta 版本
./release.sh 1.0.2-beta.1 --tag beta

# 使用国内镜像源发布
./release.sh 1.0.2 --china

# 跳过构建步骤 (如果已经构建过)
./release.sh 1.0.2 --skip-build
```

## 📋 分步操作 (传统方式)

如果需要分步控制，可以使用传统方式：

### 1. 版本管理

```bash
# 更新到指定版本
./version.sh 1.0.2

# 更新补丁版本
./version.sh patch

# 模拟运行版本更新
./version.sh 1.0.2 --dry-run

# 更新版本但不自动提交
./version.sh 1.0.2 --no-commit
```

### 2. 构建验证

```bash
# 验证构建是否正常
./test.sh
```

### 3. 发布包

```bash
# 标准发布 (国际用户)
./publish.sh

# 国内发布 (国内用户)
./publish-cn.sh

# 模拟发布
./publish.sh --dry-run

# 发布到指定标签
./publish.sh --tag beta
```

## 🔧 镜像源管理

```bash
# 查看当前镜像源
./registry.sh status

# 切换到国内镜像源
./registry.sh china

# 切换到官方镜像源
./registry.sh official

# 重置镜像源配置
./registry.sh reset
```

## 💡 使用技巧

### 1. 首次发布流程

```bash
# 1. 确保代码已提交
git add . && git commit -m "feat: ready for first release"

# 2. 一键发布 (推荐)
./release.sh 1.0.0

# 或分步操作
./version.sh 1.0.0
./test.sh
./publish.sh
```

### 2. 日常更新流程

```bash
# 修复Bug - 补丁版本
./release.sh patch

# 新功能 - 次版本  
./release.sh minor

# 重大更新 - 主版本
./release.sh major
```

### 3. 国内用户优化

```bash
# 使用国内镜像源 + 发布
./registry.sh china
./release.sh 1.0.2 --china
```

### 4. 团队协作

```bash
# 模拟运行，确认无误
./release.sh 1.0.2 --dry-run

# 确认后正式发布
./release.sh 1.0.2
```

## ⚠️ 注意事项

### 1. 发布前检查

- ✅ 确保所有代码已提交
- ✅ 确保在主分支 (main/master)
- ✅ 确保已登录 NPM: `npm whoami`
- ✅ 确保版本号符合语义化版本规范

### 2. 版本号规范

- `patch`: 修复Bug (1.0.0 → 1.0.1)
- `minor`: 新功能 (1.0.0 → 1.1.0)
- `major`: 重大更新 (1.0.0 → 2.0.0)
- 具体版本: `1.2.3` 格式

### 3. 发布标签

- `latest`: 正式版本 (默认)
- `beta`: 测试版本
- `alpha`: 开发版本
- 自定义标签: 如 `next`, `experimental`

### 4. 国内用户提示

如果在国内环境，建议：
1. 使用 `./registry.sh china` 切换镜像源
2. 使用 `./release.sh <version> --china` 发布

## 🆘 常见问题

### 1. 登录问题

```bash
# 检查登录状态
npm whoami

# 登录 NPM
npm login

# 国内用户登录官方源
npm login --registry=https://registry.npmjs.org/
```

### 2. 版本号问题

```bash
# 检查当前版本
cat package.json | grep version

# 查看版本历史
git tag --list

# 删除错误的标签 (本地)
git tag -d v1.0.1

# 删除错误的标签 (远程)
git push origin --delete v1.0.1
```

### 3. 工作目录不干净

```bash
# 查看未提交的文件
git status

# 提交所有更改
git add . && git commit -m "chore: prepare for release"

# 或重置更改
git checkout .
```

### 4. 构建失败

```bash
# 清理并重新安装依赖
rm -rf node_modules packages/*/node_modules
pnpm install

# 手动构建检查
pnpm run build:packages
pnpm run build
```

## 📞 获取帮助

每个脚本都支持 `--help` 参数：

```bash
./release.sh --help
./version.sh --help
./publish.sh --help
```

---

🎉 现在您可以使用 `./release.sh <version>` 一键发布 XH-GIS 包了！