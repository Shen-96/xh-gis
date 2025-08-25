#!/bin/bash

# XH-GIS 发布脚本
# 用于发布 @xh-gis/engine, @xh-gis/widgets, 和 xh-gis 三个包

set -e

echo "🚀 开始XH-GIS 包发布流程..."

# 检查是否已登录 npm
if ! npm whoami &> /dev/null; then
    echo "❌ 请先登录 npm: npm login"
    exit 1
fi

echo "📦 当前 npm 用户: $(npm whoami)"

# 检查工作目录是否干净
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ 工作目录不干净，请先提交所有更改"
    exit 1
fi

# 安装依赖
echo "📥 安装依赖..."
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
echo "📤 开始发布包..."

# 1. 发布 @xh-gis/engine
echo "📤 发布 @xh-gis/engine..."
cd packages/engine
npm publish
cd ../..

# 2. 发布 @xh-gis/widgets
echo "📤 发布 @xh-gis/widgets..."
cd packages/widgets
npm publish
cd ../..

# 3. 发布 xh-gis
echo "📤 发布 xh-gis..."
npm publish

# 恢复原始文件
echo "🔄 恢复原始文件..."
mv package.json.backup package.json
mv packages/widgets/package.json.backup packages/widgets/package.json

echo "✅ 所有包发布完成！"
echo ""
echo "📦 已发布的包："
echo "  - @xh-gis/engine@$(node -p "require('./packages/engine/package.json').version")"
echo "  - @xh-gis/widgets@$(node -p "require('./packages/widgets/package.json').version")"
echo "  - xh-gis@$(node -p "require('./package.json').version")"
echo ""
echo "🎉 发布成功！"