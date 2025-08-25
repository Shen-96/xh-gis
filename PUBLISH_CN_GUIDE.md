# 🇨🇳 国内用户发布指南

## 📋 问题说明

由于国内网络环境限制，很多开发者使用了NPM镜像源（如淘宝镜像），这会导致发布时出现问题：

- ❌ 无法发布包到镜像源（镜像源是只读的）
- ❌ `npm login` 失败
- ❌ 发布权限问题

## 🛠 解决方案

我们提供了专门的国内环境发布工具来解决这些问题。

### 方案一：使用自动发布脚本（推荐）

```bash
# 使用国内环境专用发布脚本
./publish-cn.sh
```

这个脚本会自动：
1. 临时切换到官方NPM源
2. 执行发布流程
3. 自动恢复原始镜像源配置

### 方案二：手动切换源

```bash
# 1. 切换到官方源
./registry.sh official

# 2. 登录NPM官方源
npm login

# 3. 执行发布
./publish.sh

# 4. 切换回国内镜像源
./registry.sh taobao
```

## 🔧 镜像源管理工具

我们提供了便捷的镜像源管理工具：

```bash
# 查看当前配置
./registry.sh current

# 切换到官方源
./registry.sh official

# 切换到淘宝镜像
./registry.sh taobao

# 测试当前源的连接速度
./registry.sh test

# 查看帮助
./registry.sh help
```

## 🚀 完整发布流程

### 首次发布

1. **准备NPM账户**
   ```bash
   # 注册账户（在浏览器中）
   https://www.npmjs.com/signup
   ```

2. **配置和登录**
   ```bash
   # 临时切换到官方源
   ./registry.sh official
   
   # 登录NPM
   npm login
   ```

3. **执行发布**
   ```bash
   # 使用国内专用发布脚本
   ./publish-cn.sh
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

3. **发布新版本**
   ```bash
   ./publish-cn.sh
   ```

## 📦 用户安装指南

发布成功后，用户可以通过以下方式安装：

### 使用默认镜像源（推荐）
```bash
npm install xh-gis
```

### 指定使用淘宝镜像
```bash
npm install xh-gis --registry=https://registry.npmmirror.com/
```

### 使用pnpm安装
```bash
pnpm add xh-gis
```

### 使用yarn安装
```bash
yarn add xh-gis
```

## 🔍 验证发布结果

发布完成后，可以通过以下方式验证：

1. **检查NPM官网**
   - https://www.npmjs.com/package/@xh-gis/engine
   - https://www.npmjs.com/package/@xh-gis/widgets
   - https://www.npmjs.com/package/xh-gis

2. **测试安装**
   ```bash
   # 在临时目录测试
   mkdir test-install && cd test-install
   npm init -y
   npm install xh-gis
   ```

3. **测试导入**
   ```javascript
   // test.js
   const { XgEarth } = require('xh-gis');
   console.log('XH-GIS 安装成功！');
   ```

## ⚠️ 注意事项

1. **网络问题**
   - 发布时需要稳定的网络连接
   - 如果发布失败，请检查网络后重试

2. **版本同步**
   - 确保三个包的版本号保持一致
   - 使用 `./version.sh` 脚本统一更新版本

3. **依赖关系**
   - engine包必须先发布成功
   - widgets包依赖engine包
   - 根包依赖前两个包

4. **权限检查**
   - 确保NPM账户有发布权限
   - 包名没有被其他用户占用

## 🆘 常见问题

### Q: 登录时报错 "Unable to authenticate"
**A:** 检查网络连接，确保能访问NPM官方源，使用 `./registry.sh test` 测试连接。

### Q: 发布时提示包名已存在
**A:** 包名可能被占用，可以选择修改包名或联系NPM支持。

### Q: 发布后在镜像源找不到包
**A:** 镜像源同步需要时间（通常10-30分钟），请耐心等待。

### Q: pnpm install失败
**A:** 尝试清除缓存：
```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

## 📞 获取帮助

如果遇到问题：
1. 查看错误日志详细信息
2. 检查网络连接状态
3. 确认NPM账户状态
4. 提交GitHub Issue

---

🎉 祝你发布顺利！