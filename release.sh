#!/bin/bash

# XH-GIS 一键发布脚本
# 集成版本管理、构建、发布功能，支持自动化流程

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
    echo "XH-GIS 一键发布脚本"
    echo ""
    echo "用法:"
    echo "  $0 [选项] <版本号>"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示帮助信息"
    echo "  -d, --dry-run  模拟运行，不实际发布"
    echo "  -s, --skip-build 跳过构建步骤"
    echo "  -t, --tag <tag> 指定发布标签 (默认: latest)"
    echo "  --china        使用国内镜像源发布"
    echo ""
    echo "版本号格式:"
    echo "  major.minor.patch (如: 1.0.1)"
    echo "  或使用语义化版本关键词:"
    echo "    patch  - 补丁版本 (1.0.0 -> 1.0.1)"
    echo "    minor  - 次版本 (1.0.0 -> 1.1.0)" 
    echo "    major  - 主版本 (1.0.0 -> 2.0.0)"
    echo ""
    echo "示例:"
    echo "  $0 1.0.1                   # 发布指定版本"
    echo "  $0 patch                   # 发布补丁版本"
    echo "  $0 minor --dry-run         # 模拟发布次版本"
    echo "  $0 1.0.1 --china           # 使用国内源发布"
    echo "  $0 1.0.1 --tag beta        # 发布beta版本"
}

# 默认参数
DRY_RUN=false
SKIP_BUILD=false
TAG="latest"
USE_CHINA=false
NEW_VERSION=""

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
        --china)
            USE_CHINA=true
            shift
            ;;
        -*)
            error "未知选项: $1"
            echo "使用 $0 --help 查看帮助信息"
            exit 1
            ;;
        *)
            if [ -z "$NEW_VERSION" ]; then
                NEW_VERSION="$1"
            else
                error "多余的参数: $1"
                exit 1
            fi
            shift
            ;;
    esac
done

# 检查版本号参数
if [ -z "$NEW_VERSION" ]; then
    error "请提供版本号或版本类型"
    echo "使用 $0 --help 查看帮助信息"
    exit 1
fi

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")

# 处理语义化版本关键词
if [[ "$NEW_VERSION" =~ ^(major|minor|patch)$ ]]; then
    info "计算 $NEW_VERSION 版本号..."
    NEW_VERSION=$(npm version $NEW_VERSION --no-git-tag-version --dry-run 2>/dev/null | sed 's/^v//')
    # 恢复 package.json
    git checkout package.json 2>/dev/null || true
fi

# 验证版本号格式
if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    error "无效的版本号格式: $NEW_VERSION"
    error "版本号应该是 major.minor.patch 格式 (如: 1.0.1)"
    exit 1
fi

# 检查版本号是否大于当前版本
if ! node -e "
const semver = require('semver');
try {
  if (!semver.gt('$NEW_VERSION', '$CURRENT_VERSION')) {
    console.error('新版本 $NEW_VERSION 必须大于当前版本 $CURRENT_VERSION');
    process.exit(1);
  }
} catch (e) {
  // 如果没有 semver，简单比较
  if ('$NEW_VERSION' <= '$CURRENT_VERSION') {
    console.error('新版本 $NEW_VERSION 必须大于当前版本 $CURRENT_VERSION');
    process.exit(1);
  }
}
" 2>/dev/null; then
    # 简单的字符串比较作为备选
    if [[ "$NEW_VERSION" == "$CURRENT_VERSION" ]]; then
        error "新版本不能与当前版本相同"
        exit 1
    fi
fi

info "🚀 开始 XH-GIS 一键发布流程..."
info "当前版本: $CURRENT_VERSION"
info "目标版本: $NEW_VERSION"
info "发布标签: $TAG"

if [ "$DRY_RUN" = true ]; then
    warn "模拟模式：不会实际发布到 NPM"
fi

if [ "$USE_CHINA" = true ]; then
    info "将使用国内镜像源发布"
fi

# 检查登录状态
if [ "$DRY_RUN" = false ]; then
    if ! npm whoami &> /dev/null; then
        if [ "$USE_CHINA" = true ]; then
            error "请先登录 NPM 官方源: npm login --registry=https://registry.npmjs.org/"
        else
            error "请先登录 NPM: npm login"
        fi
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

# 1. 更新版本号
info "📝 更新版本号到 $NEW_VERSION..."

# 更新根包版本
npm version $NEW_VERSION --no-git-tag-version > /dev/null

# 更新 engine 包版本
cd packages/engine
npm version $NEW_VERSION --no-git-tag-version > /dev/null
cd ../..

# 更新 widgets 包版本并更新依赖
cd packages/widgets
npm version $NEW_VERSION --no-git-tag-version > /dev/null
sed -i.bak "s/\"@xh-gis\/engine\": \"workspace:[^\"]*\"/\"@xh-gis\/engine\": \"workspace:^$NEW_VERSION\"/g" package.json
rm -f package.json.bak
cd ../..

# 更新根包对子包的依赖版本
sed -i.bak -e "s/\"@xh-gis\/engine\": \"workspace:[^\"]*\"/\"@xh-gis\/engine\": \"workspace:^$NEW_VERSION\"/g" -e "s/\"@xh-gis\/widgets\": \"workspace:[^\"]*\"/\"@xh-gis\/widgets\": \"workspace:^$NEW_VERSION\"/g" package.json
rm -f package.json.bak

# 更新 index.ts 中的版本号
sed -i.bak "s/export const version = \"[^\"]*\"/export const version = \"$NEW_VERSION\"/g" index.ts
rm -f index.ts.bak

success "版本号更新完成"

# 2. 重新安装依赖
info "📥 重新安装依赖..."
pnpm install

# 3. 构建项目
if [ "$SKIP_BUILD" = false ]; then
    info "🔨 构建所有包..."
    pnpm run build:packages
    pnpm run build
    success "构建完成"
else
    warn "跳过构建步骤"
fi

# 4. 运行测试（如果存在）
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    info "🧪 运行测试..."
    if ! pnpm test; then
        error "测试失败，发布已终止"
        exit 1
    fi
    success "测试通过"
fi

# 5. 提交版本更改
info "📝 提交版本更改..."
git add .
git commit -m "chore: bump version to $NEW_VERSION

- Update all packages to version $NEW_VERSION
- Update workspace dependencies
- Update version constant in index.ts"

git tag "v$NEW_VERSION"
success "版本更改已提交并打标签"

# 6. 推送到远程仓库
if [ "$DRY_RUN" = false ]; then
    info "⬆️  推送到远程仓库..."
    git push origin main --tags
    success "代码已推送到远程仓库"
fi

# 7. 发布包
if [ "$DRY_RUN" = false ]; then
    if [ "$USE_CHINA" = true ]; then
        info "🇨🇳 使用国内镜像源发布..."
        # 调用国内发布脚本
        ./publish-cn.sh
    else
        info "🌍 发布到 NPM..."
        
        # 准备发布 - 转换 workspace 依赖
        info "🔄 准备发布文件..."
        
        # 获取实际版本号用于替换
        ENGINE_VERSION=$(node -p "require('./packages/engine/package.json').version")
        WIDGETS_VERSION=$(node -p "require('./packages/widgets/package.json').version")
        ROOT_VERSION=$(node -p "require('./package.json').version")
        
        # 为 widgets 包准备发布版本
        cp packages/widgets/package.json packages/widgets/package.json.backup
        sed "s/\"@xh-gis\/engine\": \"workspace:\\^$ENGINE_VERSION\"/\"@xh-gis\/engine\": \"^$ENGINE_VERSION\"/g" packages/widgets/package.json.backup > packages/widgets/package.json
        
        # 为根包准备发布版本
        cp package.json package.json.backup
        sed -e "s/\"@xh-gis\/engine\": \"workspace:\\^$ENGINE_VERSION\"/\"@xh-gis\/engine\": \"^$ENGINE_VERSION\"/g" -e "s/\"@xh-gis\/widgets\": \"workspace:\\^$WIDGETS_VERSION\"/\"@xh-gis\/widgets\": \"^$WIDGETS_VERSION\"/g" package.json.backup > package.json
        
        # 发布顺序：先发布 engine，再发布 widgets，最后发布根包
        info "📤 发布 @xh-gis/engine@$ENGINE_VERSION..."
        cd packages/engine
        npm publish --tag $TAG
        cd ../..
        
        # 等待 CDN 传播
        info "⏳ 等待 NPM CDN 传播（30秒）..."
        sleep 30
        
        info "📤 发布 @xh-gis/widgets@$WIDGETS_VERSION..."
        cd packages/widgets
        npm publish --tag $TAG
        cd ../..
        
        # 等待 CDN 传播
        info "⏳ 等待 NPM CDN 传播（30秒）..."
        sleep 30
        
        info "📤 发布 xh-gis@$ROOT_VERSION..."
        npm publish --tag $TAG
        
        # 恢复原始文件
        info "🔄 恢复原始文件..."
        mv package.json.backup package.json
        mv packages/widgets/package.json.backup packages/widgets/package.json
        
        success "所有包发布完成！"
    fi
else
    warn "模拟模式：跳过实际发布"
fi

# 8. 显示发布结果
echo ""
success "🎉 发布流程完成！"
echo ""
info "📦 已发布的包："
echo "  - @xh-gis/engine@$NEW_VERSION"
echo "  - @xh-gis/widgets@$NEW_VERSION"
echo "  - xh-gis@$NEW_VERSION"
echo ""
if [ "$TAG" != "latest" ]; then
    info "📋 发布标签: $TAG"
    echo ""
fi
info "🌐 查看发布状态："
echo "  - https://www.npmjs.com/package/@xh-gis/engine"
echo "  - https://www.npmjs.com/package/@xh-gis/widgets"
echo "  - https://www.npmjs.com/package/xh-gis"
echo ""
info "💡 安装命令："
if [ "$TAG" = "latest" ]; then
    echo "  npm install xh-gis"
else
    echo "  npm install xh-gis@$TAG"
fi
echo ""
success "✨ 发布成功！感谢使用 XH-GIS！"