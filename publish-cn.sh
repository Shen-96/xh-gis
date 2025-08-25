#!/bin/bash

# XH-GIS 国内环境发布脚本
# 专门处理国内镜像源环境下的NPM包发布

set -e

echo "🇨🇳 开始国内环境 XH-GIS 包发布流程..."

# 检查当前registry配置
CURRENT_NPM_REGISTRY=$(npm config get registry)
CURRENT_PNPM_REGISTRY=$(pnpm config get registry)

echo "📋 当前配置："
echo "  NPM Registry: $CURRENT_NPM_REGISTRY"
echo "  PNPM Registry: $CURRENT_PNPM_REGISTRY"

# 临时切换到官方源用于发布
NPM_OFFICIAL_REGISTRY="https://registry.npmjs.org/"
CHINA_MIRROR_REGISTRY="https://registry.npmmirror.com/"

echo "🔄 临时切换到官方源进行发布..."
npm config set registry $NPM_OFFICIAL_REGISTRY
pnpm config set registry $NPM_OFFICIAL_REGISTRY

echo "✅ 已切换到官方源: $NPM_OFFICIAL_REGISTRY"

# 检查是否已登录 npm
echo "🔐 检查 NPM 登录状态..."
if ! npm whoami &> /dev/null; then
    echo "❌ 请先登录 npm官方源:"
    echo "   npm login --registry=https://registry.npmjs.org/"
    echo ""
    echo "💡 登录提示："
    echo "   1. 访问 https://www.npmjs.com/ 注册账户（如果还没有）"
    echo "   2. 运行登录命令并输入用户名、密码和邮箱"
    echo "   3. 检查邮箱验证码（如果需要）"
    
    # 恢复原始registry配置
    npm config set registry $CURRENT_NPM_REGISTRY
    pnpm config set registry $CURRENT_PNPM_REGISTRY
    echo "🔄 已恢复原始镜像源配置"
    exit 1
fi

echo "📦 当前 npm 用户: $(npm whoami)"

# 检查工作目录是否干净
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ 工作目录不干净，请先提交所有更改"
    # 恢复原始registry配置
    npm config set registry $CURRENT_NPM_REGISTRY
    pnpm config set registry $CURRENT_PNPM_REGISTRY
    exit 1
fi

# 安装依赖（使用官方源确保一致性）
echo "📥 使用官方源安装依赖..."
pnpm install

# 构建所有包
echo "🔨 构建所有包..."
pnpm run build:packages

# 构建根包
echo "🔨 构建根包..."
pnpm run build

# 准备发布 - 转换 workspace 依赖
echo "🔄 准备发布文件..."

# 为 widgets 包准备发布版本
cp packages/widgets/package.json packages/widgets/package.json.backup
sed 's/"@xh-gis\/engine": "workspace:^1.0.0"/"@xh-gis\/engine": "^1.0.0"/g' packages/widgets/package.json.backup > packages/widgets/package.json

# 为根包准备发布版本
cp package.json package.json.backup
sed -e 's/"@xh-gis\/engine": "workspace:^1.0.0"/"@xh-gis\/engine": "^1.0.0"/g' -e 's/"@xh-gis\/widgets": "workspace:^1.0.0"/"@xh-gis\/widgets": "^1.0.0"/g' package.json.backup > package.json

# 发布顺序：先发布 engine，再发布 widgets，最后发布根包
echo "📤 开始发布包到官方源..."

# 1. 发布 @xh-gis/engine
echo "📤 发布 @xh-gis/engine..."
cd packages/engine
npm publish --registry=$NPM_OFFICIAL_REGISTRY
cd ../..

# 等待一段时间，让包在CDN上传播
echo "⏳ 等待包在NPM CDN上传播（30秒）..."
sleep 30

# 2. 发布 @xh-gis/widgets
echo "📤 发布 @xh-gis/widgets..."
cd packages/widgets
npm publish --registry=$NPM_OFFICIAL_REGISTRY
cd ../..

# 等待一段时间
echo "⏳ 等待包在NPM CDN上传播（30秒）..."
sleep 30

# 3. 发布 xh-gis
echo "📤 发布 xh-gis..."
npm publish --registry=$NPM_OFFICIAL_REGISTRY

# 恢复原始文件
echo "🔄 恢复原始文件..."
mv package.json.backup package.json
mv packages/widgets/package.json.backup packages/widgets/package.json

# 恢复原始registry配置
echo "🔄 恢复原始镜像源配置..."
npm config set registry $CURRENT_NPM_REGISTRY
pnpm config set registry $CURRENT_PNPM_REGISTRY

echo "✅ 已恢复镜像源配置："
echo "  NPM Registry: $(npm config get registry)"
echo "  PNPM Registry: $(pnpm config get registry)"

echo ""
echo "✅ 所有包发布完成！"
echo ""
echo "📦 已发布的包："
echo "  - @xh-gis/engine@$(node -p "require('./packages/engine/package.json').version")"
echo "  - @xh-gis/widgets@$(node -p "require('./packages/widgets/package.json').version")"
echo "  - xh-gis@$(node -p "require('./package.json').version")"
echo ""
echo "🌐 查看发布状态："
echo "  - https://www.npmjs.com/package/@xh-gis/engine"
echo "  - https://www.npmjs.com/package/@xh-gis/widgets"  
echo "  - https://www.npmjs.com/package/xh-gis"
echo ""
echo "💡 国内用户安装提示："
echo "  # 使用默认镜像源安装（推荐）"
echo "  npm install xh-gis"
echo ""
echo "  # 或指定使用淘宝镜像"
echo "  npm install xh-gis --registry=https://registry.npmmirror.com/"
echo ""
echo "🎉 发布成功！"