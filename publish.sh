#!/bin/bash

# XH-GIS 发布脚本
# 用于发布 @xh-gis/engine, @xh-gis/widgets, 和 xh-gis 三个包或单独发布指定包

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
    echo "  $0 [选项] <包名>"
    echo ""
    echo "选项:"
    echo "  -h, --help        显示帮助信息"
    echo "  -d, --dry-run     模拟运行，不实际发布"
    echo "  -s, --skip-build  跳过构建步骤"
    echo "  -t, --tag <tag>   指定发布标签 (默认: latest)"
    echo "  -y, --yes         自动确认所有提示"
    echo ""
    echo "包名:"
    echo "  engine    - @xh-gis/engine 包"
    echo "  widgets   - @xh-gis/widgets 包"
    echo "  root      - xh-gis 根包"
    echo ""
    echo "示例:"
    echo "  $0                    # 正常发布所有包"
    echo "  $0 --dry-run          # 模拟发布所有包"
    echo "  $0 --tag beta         # 发布所有包的beta版本"
    echo "  $0 engine             # 发布 engine 包"
    echo "  $0 widgets --tag beta # 发布 widgets 包的beta版本"
    echo "  $0 engine -y          # 发布 engine 包并自动确认"
}

# 默认参数
DRY_RUN=false
SKIP_BUILD=false
TAG="latest"
PACKAGE_NAME=""
AUTO_CONFIRM=false

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
        -y|--yes)
            AUTO_CONFIRM=true
            shift
            ;;
        -*)
            error "未知选项: $1"
            echo "使用 $0 --help 查看帮助信息"
            exit 1
            ;;
        *)
            if [ -z "$PACKAGE_NAME" ] && [[ "$1" =~ ^(engine|widgets|root)$ ]]; then
                PACKAGE_NAME="$1"
            else
                error "多余的参数: $1"
                echo "使用 $0 --help 查看帮助信息"
                exit 1
            fi
            shift
            ;;
    esac
done

if [ -n "$PACKAGE_NAME" ]; then
    info "🚀 开始发布 $PACKAGE_NAME 包..."
else
    info "🚀 开始 XH-GIS 包发布流程..."
fi

if [ "$DRY_RUN" = true ]; then
    warn "模拟模式：不会实际发布到 NPM"
fi

if [ "$TAG" != "latest" ]; then
    info "发布标签: $TAG"
fi

# 检查是否已登录 npm
info "检查 NPM 登录状态..."
if [ "$DRY_RUN" = false ]; then
    if ! npm whoami &> /dev/null; then
        error "请先登录 npm: npm login"
        exit 1
    fi
    success "NPM 用户: $(npm whoami)"
fi

info "检查工作目录状态..."
# 检查工作目录是否干净（排除 pnpm-lock.yaml 文件）
# 使用 || true 确保即使 grep 没有匹配也不会导致脚本退出
UNCOMMITTED_FILES=$(git status --porcelain | grep -v "pnpm-lock.yaml" || true)
if [[ -n "$UNCOMMITTED_FILES" ]]; then
    error "工作目录不干净，请先提交所有更改"
    echo "未提交的文件:"
    echo "$UNCOMMITTED_FILES"
    exit 1
fi

info "检查分支状态..."
# 检查是否在主分支
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
info "当前分支: $CURRENT_BRANCH"
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    info "不在主分支上"
    if [ "$AUTO_CONFIRM" = true ]; then
        warn "当前不在主分支 ($CURRENT_BRANCH)，但已启用自动确认，继续执行..."
    else
        warn "当前不在主分支 ($CURRENT_BRANCH)，确定要继续吗？ (y/n)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            info "发布已取消"
            exit 0
        fi
    fi
else
    info "在主分支上，继续执行..."
fi

info "获取版本信息..."
# 获取版本信息
if [ -n "$PACKAGE_NAME" ]; then
    # 单包模式
    info "正在获取单包版本信息..."
    if [ "$PACKAGE_NAME" = "engine" ]; then
        PACKAGE_VERSION=$(node -p "require('./packages/engine/package.json').version")
        FULL_PACKAGE_NAME="@xh-gis/engine"
        PACKAGE_DIR="packages/engine"
    elif [ "$PACKAGE_NAME" = "widgets" ]; then
        PACKAGE_VERSION=$(node -p "require('./packages/widgets/package.json').version")
        FULL_PACKAGE_NAME="@xh-gis/widgets"
        PACKAGE_DIR="packages/widgets"
    else
        PACKAGE_VERSION=$(node -p "require('./package.json').version")
        FULL_PACKAGE_NAME="xh-gis"
        PACKAGE_DIR="."
    fi
    
    info "当前版本信息:"
    echo "  - $FULL_PACKAGE_NAME@$PACKAGE_VERSION"
else
    # 统一模式
    info "正在获取统一版本信息..."
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
fi

# 安装依赖
info "📥 安装依赖..."
info "执行 pnpm install..."
pnpm install
success "依赖安装完成"

# 构建包
if [ "$SKIP_BUILD" = false ]; then
    if [ -n "$PACKAGE_NAME" ]; then
        # 单包模式
        info "🔨 构建 $FULL_PACKAGE_NAME 包..."
        info "进入目录: $PACKAGE_DIR"
        if [ "$PACKAGE_DIR" = "." ]; then
            info "执行 pnpm run build:packages && pnpm run build"
            pnpm run build:packages
            pnpm run build
        else
            info "执行 pnpm run build"
            cd "$PACKAGE_DIR"
            pnpm run build
            cd - > /dev/null
        fi
        success "构建完成"
    else
        # 统一模式
        info "🔨 构建所有包..."
        info "执行 pnpm run build:packages && pnpm run build"
        pnpm run build:packages
        pnpm run build
        success "构建完成"
    fi
else
    warn "跳过构建步骤"
fi

# 运行测试（如果存在）- 仅在统一模式下运行
if [ -z "$PACKAGE_NAME" ] && [ -f "package.json" ] && grep -q '"test"' package.json; then
    info "🧪 运行测试..."
    if ! pnpm test; then
        error "测试失败，发布已终止"
        exit 1
    fi
    success "测试通过"
fi

# 检查包是否已构建
if [ -n "$PACKAGE_NAME" ]; then
    # 单包模式
    if [ "$PACKAGE_NAME" = "engine" ] || [ "$PACKAGE_NAME" = "widgets" ]; then
        if [ ! -d "$PACKAGE_DIR/dist" ]; then
            error "$FULL_PACKAGE_NAME 包未构建，请先运行构建命令"
            exit 1
        fi
    else
        if [ ! -d "dist" ]; then
            error "$FULL_PACKAGE_NAME 包未构建，请先运行构建命令"
            exit 1
        fi
    fi
else
    # 统一模式
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
fi

# 发布前确认
if [ "$DRY_RUN" = false ]; then
    if [ -n "$PACKAGE_NAME" ]; then
        # 单包模式
        warn "即将发布 $FULL_PACKAGE_NAME@$PACKAGE_VERSION 到 NPM"
    else
        # 统一模式
        warn "即将发布以下包到 NPM:"
        echo "  - @xh-gis/engine@$ENGINE_VERSION"
        echo "  - @xh-gis/widgets@$WIDGETS_VERSION"
        echo "  - xh-gis@$ROOT_VERSION"
    fi
    echo ""
    
    if [ "$AUTO_CONFIRM" = true ]; then
        info "自动确认发布..."
    else
        echo "确定要继续吗？ (y/n)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            info "发布已取消"
            exit 0
        fi
    fi
fi

# 准备发布 - 转换 workspace 依赖
info "🔄 准备发布文件..."

if [ -n "$PACKAGE_NAME" ]; then
    # 单包模式
    if [ "$PACKAGE_NAME" = "widgets" ]; then
        # 为 widgets 包准备发布版本
        info "转换 widgets 包的 workspace 依赖..."
        cp packages/widgets/package.json packages/widgets/package.json.backup
        info "转换前 widgets 依赖: $(grep '@xh-gis/engine' packages/widgets/package.json.backup)"
        sed "s/\"@xh-gis\/engine\": \"workspace:\^$PACKAGE_VERSION\"/\"@xh-gis\/engine\": \"^$PACKAGE_VERSION\"/g" packages/widgets/package.json.backup > packages/widgets/package.json
        info "转换后 widgets 依赖: $(grep '@xh-gis/engine' packages/widgets/package.json)"
    elif [ "$PACKAGE_NAME" = "root" ]; then
        # 获取其他包的版本
        ENGINE_VERSION=$(node -p "require('./packages/engine/package.json').version")
        WIDGETS_VERSION=$(node -p "require('./packages/widgets/package.json').version")
        
        info "转换根包的 workspace 依赖..."
        info "ENGINE_VERSION: $ENGINE_VERSION"
        info "WIDGETS_VERSION: $WIDGETS_VERSION"
        
        # 为根包准备发布版本
        cp package.json package.json.backup
        info "转换前根包依赖:"
        grep -A 3 '"dependencies"' package.json.backup
        
        sed -e "s/\"@xh-gis\/engine\": \"workspace:\^$ENGINE_VERSION\"/\"@xh-gis\/engine\": \"^$ENGINE_VERSION\"/g" -e "s/\"@xh-gis\/widgets\": \"workspace:\^$WIDGETS_VERSION\"/\"@xh-gis\/widgets\": \"^$WIDGETS_VERSION\"/g" package.json.backup > package.json
        
        info "转换后根包依赖:"
        grep -A 3 '"dependencies"' package.json
    fi
else
    # 统一模式
    info "转换统一模式的 workspace 依赖..."
    info "ENGINE_VERSION: $ENGINE_VERSION"
    info "WIDGETS_VERSION: $WIDGETS_VERSION"
    
    # 为 widgets 包准备发布版本
    cp packages/widgets/package.json packages/widgets/package.json.backup
    info "转换前 widgets 依赖: $(grep '@xh-gis/engine' packages/widgets/package.json.backup || true)"
    sed -E "s/\"@xh-gis\/engine\": \"workspace:\^[^\"]*\"/\"@xh-gis\/engine\": \"^$ENGINE_VERSION\"/g; s/\"@xh-gis\/engine\": \"\^[^\"]*\"/\"@xh-gis\/engine\": \"^$ENGINE_VERSION\"/g; s/\"@xh-gis\/engine\": \"[^\"]*\"/\"@xh-gis\/engine\": \"^$ENGINE_VERSION\"/g" packages/widgets/package.json.backup > packages/widgets/package.json
    info "转换后 widgets 依赖: $(grep '@xh-gis/engine' packages/widgets/package.json || true)"

    # 为根包准备发布版本
    cp package.json package.json.backup
    info "转换前根包依赖:"
    grep -A 3 '"dependencies"' package.json.backup
    
    sed -e "s/\"@xh-gis\/engine\": \"workspace:\^$ENGINE_VERSION\"/\"@xh-gis\/engine\": \"^$ENGINE_VERSION\"/g" -e "s/\"@xh-gis\/widgets\": \"workspace:\^$WIDGETS_VERSION\"/\"@xh-gis\/widgets\": \"^$WIDGETS_VERSION\"/g" package.json.backup > package.json
    
    info "转换后根包依赖:"
    grep -A 3 '"dependencies"' package.json
fi

# 定义清理函数
cleanup() {
    info "🔄 恢复原始文件..."
    if [ -n "$PACKAGE_NAME" ]; then
        # 单包模式
        if [ "$PACKAGE_NAME" = "widgets" ] && [ -f "packages/widgets/package.json.backup" ]; then
            info "恢复 widgets package.json"
            mv packages/widgets/package.json.backup packages/widgets/package.json
        elif [ "$PACKAGE_NAME" = "root" ] && [ -f "package.json.backup" ]; then
            info "恢复根包 package.json"
            mv package.json.backup package.json
        fi
    else
        # 统一模式
        if [ -f "package.json.backup" ]; then
            info "恢复根包 package.json"
            mv package.json.backup package.json
        fi
        if [ -f "packages/widgets/package.json.backup" ]; then
            info "恢复 widgets package.json"
            mv packages/widgets/package.json.backup packages/widgets/package.json
        fi
    fi
}

# 设置清理陷阱 - 仅在错误时清理
trap 'if [ $? -ne 0 ]; then cleanup; fi' EXIT

if [ "$DRY_RUN" = true ]; then
    warn "模拟模式：跳过实际发布"
    echo "将要执行的发布命令:"
    if [ -n "$PACKAGE_NAME" ]; then
        # 单包模式
        if [ "$PACKAGE_DIR" = "." ]; then
            echo "  npm publish --tag $TAG"
        else
            echo "  cd $PACKAGE_DIR && npm publish --tag $TAG"
            # 如果是子包，也会发布根包
            if [ "$PACKAGE_NAME" != "root" ]; then
                echo "  npm publish --tag $TAG  # 自动发布根包"
            fi
        fi
    else
        # 统一模式
        echo "  1. cd packages/engine && npm publish --tag $TAG"
        echo "  2. cd packages/widgets && npm publish --tag $TAG"
        echo "  3. npm publish --tag $TAG"
    fi
else
    # 发布包
    if [ -n "$PACKAGE_NAME" ]; then
        # 单包模式
        info "📤 开始发布 $FULL_PACKAGE_NAME@$PACKAGE_VERSION..."
        
        if [ "$PACKAGE_DIR" = "." ]; then
            npm publish --tag $TAG
        else
            cd "$PACKAGE_DIR"
            npm publish --tag $TAG
            cd - > /dev/null
        fi
        
        success "$FULL_PACKAGE_NAME 发布成功"
        
        # 如果是子包发布，自动发布根包
        if [ "$PACKAGE_NAME" != "root" ]; then
            info "📤 自动发布根包..."
            
            # 等待 CDN 传播
            info "⏳ 等待 NPM CDN 传播（30秒）..."
            sleep 30
            
            # 获取根包版本
            ROOT_VERSION=$(node -p "require('./package.json').version")
            
            info "📤 发布 xh-gis@$ROOT_VERSION..."
            npm publish --tag $TAG
            success "xh-gis 发布成功"
        fi
    else
        # 统一模式
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
fi

# 显示发布结果
echo ""
success "🎉 发布流程完成！"
echo ""
info "📦 已发布的包:"
if [ -n "$PACKAGE_NAME" ]; then
    # 单包模式
    echo "  - $FULL_PACKAGE_NAME@$PACKAGE_VERSION"
    # 如果是子包发布，也显示根包
    if [ "$PACKAGE_NAME" != "root" ]; then
        ROOT_VERSION=$(node -p "require('./package.json').version")
        echo "  - xh-gis@$ROOT_VERSION"
    fi
else
    # 统一模式
    echo "  - @xh-gis/engine@$ENGINE_VERSION"
    echo "  - @xh-gis/widgets@$WIDGETS_VERSION"
    echo "  - xh-gis@$ROOT_VERSION"
fi
echo ""
if [ "$TAG" != "latest" ]; then
    info "📋 发布标签: $TAG"
    echo ""
fi
info "🌐 查看发布状态:"
if [ -n "$PACKAGE_NAME" ]; then
    # 单包模式
    if [ "$PACKAGE_NAME" = "engine" ]; then
        echo "  - https://www.npmjs.com/package/@xh-gis/engine"
        echo "  - https://www.npmjs.com/package/xh-gis"
    elif [ "$PACKAGE_NAME" = "widgets" ]; then
        echo "  - https://www.npmjs.com/package/@xh-gis/widgets"
        echo "  - https://www.npmjs.com/package/xh-gis"
    else
        echo "  - https://www.npmjs.com/package/xh-gis"
    fi
else
    # 统一模式
    echo "  - https://www.npmjs.com/package/@xh-gis/engine"
    echo "  - https://www.npmjs.com/package/@xh-gis/widgets"
    echo "  - https://www.npmjs.com/package/xh-gis"
fi
echo ""
info "💡 安装命令:"
if [ "$TAG" = "latest" ]; then
    if [ -n "$PACKAGE_NAME" ]; then
        # 单包模式
        if [ "$PACKAGE_NAME" = "engine" ]; then
            echo "  npm install @xh-gis/engine"
        elif [ "$PACKAGE_NAME" = "widgets" ]; then
            echo "  npm install @xh-gis/widgets"
        else
            echo "  npm install xh-gis"
        fi
    else
        # 统一模式
        echo "  npm install xh-gis"
    fi
else
    if [ -n "$PACKAGE_NAME" ]; then
        # 单包模式
        if [ "$PACKAGE_NAME" = "engine" ]; then
            echo "  npm install @xh-gis/engine@$TAG"
        elif [ "$PACKAGE_NAME" = "widgets" ]; then
            echo "  npm install @xh-gis/widgets@$TAG"
        else
            echo "  npm install xh-gis@$TAG"
        fi
    else
        # 统一模式
        echo "  npm install xh-gis@$TAG"
    fi
fi
echo ""
success "✨ 发布成功！"

# 发布成功后手动清理（dry-run 模式不清理）
if [ "$DRY_RUN" != true ]; then
    cleanup
fi