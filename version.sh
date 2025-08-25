#!/bin/bash

# XH-GIS 版本管理脚本
# 用于统一更新所有包的版本号

set -e

if [ $# -ne 1 ]; then
    echo "用法: $0 <版本号>"
    echo "示例: $0 1.0.1"
    exit 1
fi

NEW_VERSION=$1

echo "🔄 更新所有包的版本号到 $NEW_VERSION..."

# 更新根包版本
echo "📦 更新根包版本..."
npm version $NEW_VERSION --no-git-tag-version

# 更新 engine 包版本
echo "📦 更新 @xh-gis/engine 版本..."
cd packages/engine
npm version $NEW_VERSION --no-git-tag-version
cd ../..

# 更新 widgets 包版本
echo "📦 更新 @xh-gis/widgets 版本..."
cd packages/widgets
npm version $NEW_VERSION --no-git-tag-version

# 同时更新对 engine 的依赖版本
sed -i.bak "s/\"@xh-gis\/engine\": \"workspace:[^\"]*\"/\"@xh-gis\/engine\": \"workspace:^$NEW_VERSION\"/g" package.json
rm -f package.json.bak
cd ../..

# 更新根包对子包的依赖版本
echo "🔗 更新依赖版本..."
sed -i.bak -e "s/\"@xh-gis\/engine\": \"workspace:[^\"]*\"/\"@xh-gis\/engine\": \"workspace:^$NEW_VERSION\"/g" -e "s/\"@xh-gis\/widgets\": \"workspace:[^\"]*\"/\"@xh-gis\/widgets\": \"workspace:^$NEW_VERSION\"/g" package.json
rm -f package.json.bak

# 更新根包 index.ts 中的版本号
echo "📝 更新版本常量..."
sed -i.bak "s/export const version = \"[^\"]*\"/export const version = \"$NEW_VERSION\"/g" index.ts
rm -f index.ts.bak

echo "✅ 版本更新完成！"
echo ""
echo "📦 新版本："
echo "  - @xh-gis/engine@$NEW_VERSION"
echo "  - @xh-gis/widgets@$NEW_VERSION"
echo "  - xh-gis@$NEW_VERSION"
echo ""
echo "🔄 请运行以下命令重新构建："
echo "  pnpm install"
echo "  pnpm run build:packages"
echo "  pnpm run build"
echo ""
echo "🚀 然后可以运行 ./publish.sh 发布新版本"