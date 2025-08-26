#!/bin/bash

# XH-GIS 发布脚本
# 用于发布 @xh-gis/engine, @xh-gis/widgets, 和 xh-gis 三个包

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 输出函数
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# 显示帮助信息
show_help() {
    echo "XH-GIS 发布脚本"
    echo ""
    echo "用法:"
    echo "  $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示帮助信息"
    echo "  -d, --dry-run  模拟运行，不实际发布"
    echo "  -s, --skip-build 跳过构建步骤"
    echo "  -t, --tag <tag> 指定发布标签 (默认: latest)"
    echo ""
    echo "示例:"
    echo "  $0                    # 正常发布"
    echo "  $0 --dry-run          # 模拟发布"
    echo "  $0 --tag beta         # 发布beta版本"
}

# 默认参数
DRY_RUN=false
SKIP_BUILD=false
TAG="latest"

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -s|--skip-build)
            SKIP_BUILD=true
            shift
            ;;
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -*)
            error "未知选项: $1"
            echo "使用 $0 --help 查看帮助信息"
            exit 1
            ;;
        *)
            error "多余的参数: $1"
            echo "使用 $0 --help 查看帮助信息"
            exit 1
            ;;
    esac
done

info "🚀 开始 XH-GIS 包发布流程..."

if [ "$DRY_RUN" = true ]; then
    warn "模拟模式：不会实际发布到 NPM"
fi

if [ "$TAG" != "latest" ]; then
    info "发布标签: $TAG"
fi

# 检查是否已登录 npm
if [ "$DRY_RUN" = false ]; then
    if ! npm whoami &> /dev/null; then
        error "请先登录 npm: npm login"
        exit 1
    fi
    success "NPM 用户: $(npm whoami)"
fi

# 检查工作目录是否干净
if [[ -n $(git status --porcelain) ]]; then
    error "工作目录不干净，请先提交所有更改"
    echo "未提交的文件:"
    git status --porcelain
    exit 1
fi

# 检查是否在主分支
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    warn "当前不在主分支 ($CURRENT_BRANCH)，确定要继续吗？ (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        info "发布已取消"
        exit 0
    fi
fi

# 获取版本信息
ENGINE_VERSION=$(node -p "require('./packages/engine/package.json').version")
WIDGETS_VERSION=$(node -p "require('./packages/widgets/package.json').version")
ROOT_VERSION=$(node -p "require('./package.json').version")

info "当前版本信息:"
echo "  - @xh-gis/engine@$ENGINE_VERSION"
echo "  - @xh-gis/widgets@$WIDGETS_VERSION"
echo "  - xh-gis@$ROOT_VERSION"

# 检查版本一致性
if [ "$ENGINE_VERSION" != "$WIDGETS_VERSION" ] || [ "$ENGINE_VERSION" != "$ROOT_VERSION" ]; then
    error "包版本不一致，请先运行版本管理脚本统一版本"
    echo "运行: ./version.sh <版本号>"
    exit 1
fi

# 安装依赖
info "📥 安装依赖..."
pnpm install

# 构建所有包
if [ "$SKIP_BUILD" = false ]; then
    info "🔨 构建所有包..."
    pnpm run build:packages
    pnpm run build
    success "构建完成"
else
    warn "跳过构建步骤"
fi

# 运行测试（如果存在）
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    info "🧪 运行测试..."
    if ! pnpm test; then
        error "测试失败，发布已终止"
        exit 1
    fi
    success "测试通过"
fi

# 检查包是否已构建
if [ ! -d "packages/engine/dist" ]; then
    error "Engine 包未构建，请先运行构建命令"
    exit 1
fi

if [ ! -d "packages/widgets/dist" ]; then
    error "Widgets 包未构建，请先运行构建命令"
    exit 1
fi

if [ ! -d "dist" ]; then
    error "根包未构建，请先运行构建命令"
    exit 1
fi

# 发布前确认
if [ "$DRY_RUN" = false ]; then
    warn "即将发布以下包到 NPM:"
    echo "  - @xh-gis/engine@$ENGINE_VERSION"
    echo "  - @xh-gis/widgets@$WIDGETS_VERSION"
    echo "  - xh-gis@$ROOT_VERSION"
    echo ""
    echo "确定要继续吗？ (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        info "发布已取消"
        exit 0
    fi
fi

# 准备发布 - 转换 workspace 依赖
info "🔄 准备发布文件..."

# 为 widgets 包准备发布版本
cp packages/widgets/package.json packages/widgets/package.json.backup
sed "s/\"@xh-gis\/engine\": \"workspace:\^$ENGINE_VERSION\"/\"@xh-gis\/engine\": \"^$ENGINE_VERSION\"/g" packages/widgets/package.json.backup > packages/widgets/package.json

# 为根包准备发布版本
cp package.json package.json.backup
sed -e "s/\"@xh-gis\/engine\": \"workspace:\^$ENGINE_VERSION\"/\"@xh-gis\/engine\": \"^$ENGINE_VERSION\"/g" -e "s/\"@xh-gis\/widgets\": \"workspace:\^$WIDGETS_VERSION\"/\"@xh-gis\/widgets\": \"^$WIDGETS_VERSION\"/g" package.json.backup > package.json

# 定义清理函数
cleanup() {
    info "🔄 恢复原始文件..."
    if [ -f "package.json.backup" ]; then
        mv package.json.backup package.json
    fi
    if [ -f "packages/widgets/package.json.backup" ]; then
        mv packages/widgets/package.json.backup packages/widgets/package.json
    fi
}

# 设置清理陷阱
trap cleanup EXIT

if [ "$DRY_RUN" = true ]; then
    warn "模拟模式：跳过实际发布"
    echo "将要执行的发布命令:"
    echo "  1. cd packages/engine && npm publish --tag $TAG"
    echo "  2. cd packages/widgets && npm publish --tag $TAG"
    echo "  3. npm publish --tag $TAG"
else
    # 发布顺序：先发布 engine，再发布 widgets，最后发布根包
    info "📤 开始发布包..."
    
    # 1. 发布 @xh-gis/engine
    info "📤 发布 @xh-gis/engine@$ENGINE_VERSION..."
    cd packages/engine
    npm publish --tag $TAG
    cd ../..
    success "@xh-gis/engine 发布成功"
    
    # 等待 CDN 传播
    info "⏳ 等待 NPM CDN 传播（30秒）..."
    sleep 30
    
    # 2. 发布 @xh-gis/widgets
    info "📤 发布 @xh-gis/widgets@$WIDGETS_VERSION..."
    cd packages/widgets
    npm publish --tag $TAG
    cd ../..
    success "@xh-gis/widgets 发布成功"
    
    # 等待 CDN 传播
    info "⏳ 等待 NPM CDN 传播（30秒）..."
    sleep 30
    
    # 3. 发布 xh-gis
    info "📤 发布 xh-gis@$ROOT_VERSION..."
    npm publish --tag $TAG
    success "xh-gis 发布成功"
    
    success "所有包发布完成！"
fi

# 显示发布结果
echo ""
success "🎉 发布流程完成！"
echo ""
info "📦 已发布的包:"
echo "  - @xh-gis/engine@$ENGINE_VERSION"
echo "  - @xh-gis/widgets@$WIDGETS_VERSION"
echo "  - xh-gis@$ROOT_VERSION"
echo ""
if [ "$TAG" != "latest" ]; then
    info "📋 发布标签: $TAG"
    echo ""
fi
info "🌐 查看发布状态:"
echo "  - https://www.npmjs.com/package/@xh-gis/engine"
echo "  - https://www.npmjs.com/package/@xh-gis/widgets"
echo "  - https://www.npmjs.com/package/xh-gis"
echo ""
info "💡 安装命令:"
if [ "$TAG" = "latest" ]; then
    echo "  npm install xh-gis"
else
    echo "  npm install xh-gis@$TAG"
fi
echo ""
success "✨ 发布成功！"