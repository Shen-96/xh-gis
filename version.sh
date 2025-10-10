#!/bin/bash

# XH-GIS 版本管理脚本
# 用于统一更新所有包的版本号或单独更新指定包

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
    echo "XH-GIS 版本管理脚本"
    echo ""
    echo "用法:"
    echo "  $0 [选项] <版本号>"
    echo "  $0 [选项] <包名> <版本号>"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示帮助信息"
    echo "  -d, --dry-run  模拟运行，不实际修改文件"
    echo "  --no-commit    不自动提交更改"
    echo ""
    echo "包名 (用于单包更新):"
    echo "  engine    - @xh-gis/engine 包"
    echo "  widgets   - @xh-gis/widgets 包"
    echo "  root      - xh-gis 根包"
    echo ""
    echo "版本号格式:"
    echo "  major.minor.patch (如: 1.0.1)"
    echo "  或使用语义化版本关键词:"
    echo "    patch  - 补丁版本 (1.0.0 -> 1.0.1)"
    echo "    minor  - 次版本 (1.0.0 -> 1.1.0)" 
    echo "    major  - 主版本 (1.0.0 -> 2.0.0)"
    echo ""
    echo "示例:"
    echo "  $0 1.0.1                   # 统一更新所有包到指定版本"
    echo "  $0 patch                   # 统一更新所有包补丁版本"
    echo "  $0 engine 1.0.1            # 更新 engine 包到指定版本"
    echo "  $0 widgets patch           # 更新 widgets 包补丁版本"
    echo "  $0 root minor --dry-run    # 模拟更新根包次版本"
    echo "  $0 engine 1.0.1 --no-commit # 更新 engine 包但不自动提交"
}

# 默认参数
DRY_RUN=false
NO_COMMIT=false
PACKAGE_NAME=""
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
        --no-commit)
            NO_COMMIT=true
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
            elif [ -z "$NEW_VERSION" ]; then
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
if [ -n "$PACKAGE_NAME" ]; then
    # 单包模式
    if [ "$PACKAGE_NAME" = "engine" ]; then
        CURRENT_VERSION=$(node -p "require('./packages/engine/package.json').version")
        PACKAGE_PATH="packages/engine"
        FULL_PACKAGE_NAME="@xh-gis/engine"
    elif [ "$PACKAGE_NAME" = "widgets" ]; then
        CURRENT_VERSION=$(node -p "require('./packages/widgets/package.json').version")
        PACKAGE_PATH="packages/widgets"
        FULL_PACKAGE_NAME="@xh-gis/widgets"
    else
        CURRENT_VERSION=$(node -p "require('./package.json').version")
        PACKAGE_PATH="."
        FULL_PACKAGE_NAME="xh-gis"
    fi
else
    # 统一模式
    CURRENT_VERSION=$(node -p "require('./package.json').version")
fi

# 处理语义化版本关键词
if [[ "$NEW_VERSION" =~ ^(major|minor|patch)$ ]]; then
    info "计算 $NEW_VERSION 版本号..."
    if [ -n "$PACKAGE_NAME" ] && [ "$PACKAGE_PATH" != "." ]; then
        cd "$PACKAGE_PATH"
        TEMP_VERSION=$(npm version $NEW_VERSION --no-git-tag-version --dry-run 2>/dev/null | sed 's/^v//')
        # 恢复 package.json
        git checkout package.json 2>/dev/null || true
        cd - > /dev/null
    else
        TEMP_VERSION=$(npm version $NEW_VERSION --no-git-tag-version --dry-run 2>/dev/null | sed 's/^v//')
        # 恢复 package.json
        git checkout package.json 2>/dev/null || true
    fi
    NEW_VERSION=$TEMP_VERSION
fi

# 验证版本号格式
if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    error "无效的版本号格式: $NEW_VERSION"
    error "版本号应该是 major.minor.patch 格式 (如: 1.0.1)"
    exit 1
fi

# 检查版本号是否大于当前版本（仅在非模拟模式下检查）
if [ "$DRY_RUN" = false ] && [[ "$NEW_VERSION" == "$CURRENT_VERSION" ]]; then
    error "新版本不能与当前版本相同"
    exit 1
fi

if [ -n "$PACKAGE_NAME" ]; then
    info "🔄 更新 $FULL_PACKAGE_NAME 包的版本号..."
    info "当前版本: $CURRENT_VERSION"
    info "目标版本: $NEW_VERSION"
else
    info "🔄 更新所有包的版本号..."
    info "当前版本: $CURRENT_VERSION"
    info "目标版本: $NEW_VERSION"
fi

if [ "$DRY_RUN" = true ]; then
    warn "模拟模式：不会实际修改文件"
fi

# 检查工作目录是否干净（除非是模拟运行，排除 pnpm-lock.yaml 文件）
if [ "$DRY_RUN" = false ] && [ "$NO_COMMIT" = false ]; then
    UNCOMMITTED_FILES=$(git status --porcelain | grep -v "pnpm-lock.yaml")
    if [[ -n "$UNCOMMITTED_FILES" ]]; then
        error "工作目录不干净，请先提交所有更改"
        echo "未提交的文件:"
        echo "$UNCOMMITTED_FILES"
        exit 1
    fi
fi

# 更新版本号函数
update_version() {
    local package_path=$1
    local package_name=$2
    
    if [ "$DRY_RUN" = true ]; then
        if [ -n "$PACKAGE_NAME" ]; then
            info "[模拟] 更新 $package_name 版本到 $NEW_VERSION"
        else
            info "[模拟] 更新 $package_name 版本到 $NEW_VERSION"
        fi
        return
    fi
    
    if [ -n "$PACKAGE_NAME" ]; then
        info "📦 更新 $package_name 版本..."
    else
        info "📦 更新 $package_name 版本..."
    fi
    
    if [ "$package_path" = "." ]; then
        npm version $NEW_VERSION --no-git-tag-version > /dev/null
    else
        cd "$package_path"
        npm version $NEW_VERSION --no-git-tag-version > /dev/null
        cd - > /dev/null
    fi
}

# 更新依赖版本函数（仅在统一模式下执行）
update_dependencies() {
    # 只在统一模式下更新依赖
    if [ -n "$PACKAGE_NAME" ]; then
        return
    fi
    
    if [ "$DRY_RUN" = true ]; then
        info "[模拟] 更新依赖版本"
        return
    fi
    
    info "🔗 更新依赖版本..."
    
    # 更新 widgets 包对 engine 的依赖
    cd packages/widgets
    sed -i.bak "s/\"@xh-gis\/engine\": \"workspace:[^\"]*\"/\"@xh-gis\/engine\": \"workspace:^$NEW_VERSION\"/g" package.json
    rm -f package.json.bak
    cd ../..
    
    # 更新根包对子包的依赖版本
    sed -i.bak -e "s/\"@xh-gis\/engine\": \"workspace:[^\"]*\"/\"@xh-gis\/engine\": \"workspace:^$NEW_VERSION\"/g" -e "s/\"@xh-gis\/widgets\": \"workspace:[^\"]*\"/\"@xh-gis\/widgets\": \"workspace:^$NEW_VERSION\"/g" package.json
    rm -f package.json.bak
}

# 更新依赖版本函数（仅在单包模式且更新 engine 包时执行）
update_engine_dependencies() {
    # 只在单包模式且更新 engine 包时执行
    if [ -z "$PACKAGE_NAME" ] || [ "$PACKAGE_NAME" != "engine" ]; then
        return
    fi
    
    if [ "$DRY_RUN" = true ]; then
        info "[模拟] 更新依赖版本"
        return
    fi
    
    info "🔗 更新依赖版本..."
    
    # 更新 widgets 包对 engine 的依赖
    cd packages/widgets
    sed -i.bak "s/\"@xh-gis\/engine\": \"workspace:[^\"]*\"/\"@xh-gis\/engine\": \"workspace:^$NEW_VERSION\"/g" package.json
    rm -f package.json.bak
    cd ../..
    
    # 更新根包对 engine 的依赖
    sed -i.bak "s/\"@xh-gis\/engine\": \"workspace:[^\"]*\"/\"@xh-gis\/engine\": \"workspace:^$NEW_VERSION\"/g" package.json
    rm -f package.json.bak
}

# 更新版本常量函数（仅在统一模式或更新根包时执行）
update_version_constant() {
    # 在统一模式或更新根包时更新版本常量
    if [ -n "$PACKAGE_NAME" ] && [ "$PACKAGE_NAME" != "root" ]; then
        return
    fi
    
    if [ "$DRY_RUN" = true ]; then
        info "[模拟] 更新版本常量"
        return
    fi
    
    info "📝 更新版本常量..."
    sed -i.bak "s/export const version = \"[^\"]*\"/export const version = \"$NEW_VERSION\"/g" index.ts
    rm -f index.ts.bak
}

# 执行更新
if [ -n "$PACKAGE_NAME" ]; then
    # 单包模式
    update_version "$PACKAGE_PATH" "$FULL_PACKAGE_NAME"
    update_engine_dependencies
    update_version_constant
else
    # 统一模式
    update_version "." "根包"
    update_version "packages/engine" "@xh-gis/engine"
    update_version "packages/widgets" "@xh-gis/widgets"
    update_dependencies
    update_version_constant
fi

success "版本更新完成！"
echo ""
info "📦 新版本："
if [ -n "$PACKAGE_NAME" ]; then
    echo "  - $FULL_PACKAGE_NAME@$NEW_VERSION"
else
    echo "  - @xh-gis/engine@$NEW_VERSION"
    echo "  - @xh-gis/widgets@$NEW_VERSION"
    echo "  - xh-gis@$NEW_VERSION"
fi
echo ""

if [ "$DRY_RUN" = false ]; then
    if [ "$NO_COMMIT" = false ]; then
        if [ -n "$PACKAGE_NAME" ]; then
            info "📝 提交版本更改..."
            git add .
            git commit -m "chore($PACKAGE_NAME): bump version to $NEW_VERSION

- Update $FULL_PACKAGE_NAME to version $NEW_VERSION
- Update workspace dependencies if needed
- Update version constant if needed"
            success "版本更改已提交"
            echo ""
            info "🏷️  创建标签: ${PACKAGE_NAME}-v$NEW_VERSION"
            git tag "${PACKAGE_NAME}-v$NEW_VERSION"
            success "标签已创建"
        else
            info "📝 提交版本更改..."
            git add .
            git commit -m "chore: bump version to $NEW_VERSION

- Update all packages to version $NEW_VERSION
- Update workspace dependencies  
- Update version constant in index.ts"
            success "版本更改已提交"
            echo ""
            info "🏷️  创建标签: v$NEW_VERSION"
            git tag "v$NEW_VERSION"
            success "标签已创建"
        fi
    else
        warn "跳过自动提交，请手动提交更改"
    fi
    
    echo ""
    info "🔄 接下来的步骤："
    if [ -n "$PACKAGE_NAME" ]; then
        if [ "$PACKAGE_NAME" = "engine" ]; then
            echo "  1. 重新安装依赖: pnpm install"
            echo "  2. 构建 engine 包: cd packages/engine && pnpm run build"
            echo "  3. 发布 engine 包: cd packages/engine && npm publish"
        elif [ "$PACKAGE_NAME" = "widgets" ]; then
            echo "  1. 重新安装依赖: pnpm install"
            echo "  2. 构建 widgets 包: cd packages/widgets && pnpm run build"
            echo "  3. 发布 widgets 包: cd packages/widgets && npm publish"
        else
            echo "  1. 重新安装依赖: pnpm install"
            echo "  2. 构建所有包: pnpm run build:packages && pnpm run build"
            echo "  3. 发布根包: npm publish"
        fi
    else
        echo "  1. 重新安装依赖: pnpm install"
        echo "  2. 构建所有包: pnpm run build:packages && pnpm run build"
        echo "  3. 发布新版本: ./release.sh $NEW_VERSION"
        echo "     或使用: ./publish.sh (传统发布)"
    fi
    echo ""
else
    echo ""
    info "💡 模拟模式完成，没有实际修改文件"
fi