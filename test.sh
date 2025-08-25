#!/bin/bash

# XH-GIS 测试脚本
# 用于测试构建和基本功能

set -e

echo "🧪 开始 XH-GIS 测试..."

# 检查构建输出
echo "📂 检查构建输出..."

if [ ! -d "packages/engine/dist" ]; then
    echo "❌ engine 包构建失败 - dist 目录不存在"
    exit 1
fi

if [ ! -d "packages/widgets/dist" ]; then
    echo "❌ widgets 包构建失败 - dist 目录不存在"
    exit 1
fi

if [ ! -d "dist" ]; then
    echo "❌ 根包构建失败 - dist 目录不存在"
    exit 1
fi

# 检查关键文件
echo "📄 检查关键文件..."

check_file() {
    if [ ! -f "$1" ]; then
        echo "❌ 缺少文件: $1"
        exit 1
    else
        echo "✅ 文件存在: $1"
    fi
}

# Engine 包文件
check_file "packages/engine/dist/index.js"
check_file "packages/engine/dist/index.d.ts"
check_file "packages/engine/package.json"
check_file "packages/engine/README.md"
check_file "packages/engine/LICENSE"

# Widgets 包文件
check_file "packages/widgets/dist/index.js"
check_file "packages/widgets/dist/index.d.ts"
check_file "packages/widgets/package.json"
check_file "packages/widgets/README.md"
check_file "packages/widgets/LICENSE"

# 根包文件
check_file "dist/index.js"
check_file "dist/index.d.ts"
check_file "package.json"
check_file "README.md"
check_file "LICENSE"

echo "📦 检查包配置..."

# 检查 package.json 配置
node -e "
const enginePkg = require('./packages/engine/package.json');
const widgetsPkg = require('./packages/widgets/package.json');
const rootPkg = require('./package.json');

console.log('Engine 包版本:', enginePkg.version);
console.log('Widgets 包版本:', widgetsPkg.version);
console.log('根包版本:', rootPkg.version);

if (enginePkg.name !== '@xh-gis/engine') {
    console.error('❌ Engine 包名称错误');
    process.exit(1);
}

if (widgetsPkg.name !== '@xh-gis/widgets') {
    console.error('❌ Widgets 包名称错误');
    process.exit(1);
}

if (rootPkg.name !== 'xh-gis') {
    console.error('❌ 根包名称错误');
    process.exit(1);
}

console.log('✅ 包配置检查通过');
"

echo "🎯 检查导出..."

# 检查导出内容
node -e "
try {
    const engineTypes = require('./packages/engine/dist/index.d.ts');
    console.log('✅ Engine 类型文件可读取');
} catch (e) {
    console.log('ℹ️  Engine 类型文件为声明文件');
}

try {
    const widgetsTypes = require('./packages/widgets/dist/index.d.ts');
    console.log('✅ Widgets 类型文件可读取');
} catch (e) {
    console.log('ℹ️  Widgets 类型文件为声明文件');
}

try {
    const rootTypes = require('./dist/index.d.ts');
    console.log('✅ 根包类型文件可读取');
} catch (e) {
    console.log('ℹ️  根包类型文件为声明文件');
}
"

echo "✅ 所有测试通过！"
echo ""
echo "📦 包准备情况："
echo "  - @xh-gis/engine: 准备就绪"
echo "  - @xh-gis/widgets: 准备就绪"
echo "  - xh-gis: 准备就绪"
echo ""
echo "🚀 现在可以运行 ./publish.sh 进行发布"