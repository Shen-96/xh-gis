#!/bin/bash

# XH-GIS 版本管理脚本
# 用于统一更新所有包的版本号或单独更新指定包

set -e

# 设置错误处理
set -E
trap 'error "脚本在第 $LINENO 行发生错误，退出码: $?"' ERR

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
    echo "  -h, --help        显示帮助信息"
    echo "  -d, --dry-run     模拟运行，不实际修改文件"
    echo "  --no-commit       不自动提交更改"
    echo "  -y, --yes         自动确认所有提示"
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
    echo "  $0 engine 1.0.1 -y         # 更新 engine 包并自动确认"
}

# 默认参数
DRY_RUN=false
NO_COMMIT=true
PACKAGE_NAME=""
NEW_VERSION=""
AUTO_CONFIRM=false
# 统一模式下各包目标版本（语义关键词时按各自递增）
ROOT_TARGET_VERSION=""
ENGINE_TARGET_VERSION=""
WIDGETS_TARGET_VERSION=""

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
        --commit)
            NO_COMMIT=false
            shift
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
    if [ -n "$PACKAGE_NAME" ]; then
        # 单包模式：在对应目录计算目标版本
        if [ "$PACKAGE_PATH" != "." ]; then
            cd "$PACKAGE_PATH"
            TEMP_VERSION=$(npm version $NEW_VERSION --no-git-tag-version --dry-run 2>/dev/null | sed 's/^v//')
            git checkout package.json 2>/dev/null || true
            cd - > /dev/null
        else
            TEMP_VERSION=$(npm version $NEW_VERSION --no-git-tag-version --dry-run 2>/dev/null | sed 's/^v//')
        fi
        NEW_VERSION=$TEMP_VERSION
    else
        # 统一模式：为每个包分别计算目标版本
        # 根包
        ROOT_TARGET_VERSION=$(npm version $NEW_VERSION --no-git-tag-version --dry-run 2>/dev/null | sed 's/^v//')
        # engine 包
        cd packages/engine
        ENGINE_TARGET_VERSION=$(npm version $NEW_VERSION --no-git-tag-version --dry-run 2>/dev/null | sed 's/^v//')
        git checkout package.json 2>/dev/null || true
        cd - > /dev/null
        # widgets 包
        cd packages/widgets
        WIDGETS_TARGET_VERSION=$(npm version $NEW_VERSION --no-git-tag-version --dry-run 2>/dev/null | sed 's/^v//')
        git checkout package.json 2>/dev/null || true
        cd - > /dev/null
        # 用根包目标版本占位 NEW_VERSION 以兼容后续打印
        NEW_VERSION=$ROOT_TARGET_VERSION
    fi
fi

# 验证版本号格式
if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    error "无效的版本号格式: $NEW_VERSION"
    error "版本号应该是 major.minor.patch 格式 (如: 1.0.1)"
    exit 1
fi

# 检查版本号是否大于当前版本（仅在非模拟模式下检查）
if [ "$DRY_RUN" = false ] && [[ "$NEW_VERSION" == "$CURRENT_VERSION" ]]; then
    # 单包模式严格检查；统一模式在语义关键词下按各包分别计算
    if [ -n "$PACKAGE_NAME" ]; then
        error "新版本不能与当前版本相同"
        exit 1
    fi
fi

# 检查是否在主分支
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    if [ "$AUTO_CONFIRM" = true ]; then
        warn "当前不在主分支 ($CURRENT_BRANCH)，但已启用自动确认，继续执行..."
    else
        warn "当前不在主分支 ($CURRENT_BRANCH)，确定要继续吗？ (y/n)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            info "版本更新已取消"
            exit 0
        fi
    fi
fi

if [ -n "$PACKAGE_NAME" ]; then
    info "🔄 更新 $FULL_PACKAGE_NAME 包的版本号..."
    info "当前版本: $CURRENT_VERSION"
    info "目标版本: $NEW_VERSION"
else
    info "🔄 更新所有包的版本号..."
    info "当前根包版本: $CURRENT_VERSION"
    info "目标版本：root=${ROOT_TARGET_VERSION:-$NEW_VERSION}, engine=${ENGINE_TARGET_VERSION:-$NEW_VERSION}, widgets=${WIDGETS_TARGET_VERSION:-$NEW_VERSION}"
fi

if [ "$DRY_RUN" = true ]; then
    warn "模拟模式：不会实际修改文件"
fi

# 检查工作目录是否干净（除非是模拟运行，排除 pnpm-lock.yaml 文件）
if [ "$DRY_RUN" = false ] && [ "$NO_COMMIT" = false ]; then
    # 使用 || true 确保即使 grep 没有匹配也不会导致脚本退出
    UNCOMMITTED_FILES=$(git status --porcelain | grep -v "pnpm-lock.yaml" || true)
    if [[ -n "$UNCOMMITTED_FILES" ]]; then
        warn "工作目录不干净，将把未提交变更一并纳入本次提交"
        echo "未提交的文件:"
        echo "$UNCOMMITTED_FILES"
        # 不再退出，继续执行并在后续统一 git add .
    fi
fi

# 更新版本号函数
update_version() {
    local package_path=$1
    local package_name=$2
    local target_version=$3
    
    if [ "$DRY_RUN" = true ]; then
        info "[模拟] 更新 $package_name 版本到 $target_version"
        return
    fi
    
    if [ -n "$PACKAGE_NAME" ]; then
        info "📦 更新 $package_name 版本..."
    else
        info "📦 更新 $package_name 版本..."
    fi
    
    if [ "$package_path" = "." ]; then
        # 获取当前版本，若与目标版本相同则跳过
        local current_version
        current_version=$(node -p "require('./package.json').version")
        if [ "$current_version" = "$target_version" ]; then
            warn "目标版本与当前版本相同，跳过更新: $package_name@$target_version"
            return
        fi
        info "在当前目录执行: npm version $target_version --no-git-tag-version"
        npm version $target_version --no-git-tag-version > /dev/null
        info "npm version 命令执行完成"
    else
        info "切换到目录: $package_path"
        cd "$package_path"
        # 获取当前版本，若与目标版本相同则跳过
        local current_version
        current_version=$(node -p "require('./package.json').version")
        if [ "$current_version" = "$target_version" ]; then
            warn "目标版本与当前版本相同，跳过更新: $package_name@$target_version"
            info "切换回原目录"
            cd - > /dev/null
            info "目录切换完成"
            return
        fi
        info "在 $package_path 目录执行: npm version $target_version --no-git-tag-version"
        # 添加错误检查
        if ! npm version $target_version --no-git-tag-version > /dev/null 2>&1; then
            error "npm version 命令执行失败"
            cd - > /dev/null
            exit 1
        fi
        info "npm version 命令执行完成"
        info "切换回原目录"
        cd - > /dev/null
        info "目录切换完成"
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
    sed -i.bak "s/\"@xh-gis\/engine\": \"workspace:[^\"]*\"/\"@xh-gis\/engine\": \"workspace:^${ENGINE_TARGET_VERSION:-$NEW_VERSION}\"/g" package.json
    rm -f package.json.bak
    cd ../..
    
    # 更新根包对子包的依赖版本
    sed -i.bak -e "s/\"@xh-gis\/engine\": \"workspace:[^\"]*\"/\"@xh-gis\/engine\": \"workspace:^${ENGINE_TARGET_VERSION:-$NEW_VERSION}\"/g" -e "s/\"@xh-gis\/widgets\": \"workspace:[^\"]*\"/\"@xh-gis\/widgets\": \"workspace:^${WIDGETS_TARGET_VERSION:-$NEW_VERSION}\"/g" package.json
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

# 更新依赖版本函数（仅在单包模式且更新 widgets 包时执行）
update_widgets_dependencies() {
    # 只在单包模式且更新 widgets 包时执行
    if [ -z "$PACKAGE_NAME" ] || [ "$PACKAGE_NAME" != "widgets" ]; then
        return
    fi
    
    if [ "$DRY_RUN" = true ]; then
        info "[模拟] 更新依赖版本"
        return
    fi
    
    info "🔗 更新依赖版本..."
    
    # 更新根包对 widgets 的依赖
    sed -i.bak "s/\"@xh-gis\/widgets\": \"workspace:[^\"]*\"/\"@xh-gis\/widgets\": \"workspace:^$NEW_VERSION\"/g" package.json
    rm -f package.json.bak
}

# 自动更新根包版本函数（当子包更新时）
update_root_version_for_subpackage() {
    # 只在单包模式且更新子包时执行
    if [ -z "$PACKAGE_NAME" ] || [ "$PACKAGE_NAME" = "root" ]; then
        return
    fi
    
    if [ "$DRY_RUN" = true ]; then
        info "[模拟] 自动更新根包版本"
        return
    fi
    
    info "📦 自动更新根包版本..."
    
    # 获取当前根包版本
    ROOT_CURRENT_VERSION=$(node -p "require('./package.json').version")
    
    # 计算新的根包版本（补丁版本递增）
    ROOT_NEW_VERSION=$(echo $ROOT_CURRENT_VERSION | awk -F. '{$NF = $NF + 1;} 1' | sed 's/ /./g')
    
    info "根包当前版本: $ROOT_CURRENT_VERSION"
    info "根包目标版本: $ROOT_NEW_VERSION"
    
    # 更新根包版本
    npm version $ROOT_NEW_VERSION --no-git-tag-version > /dev/null
    
    # 更新版本常量
    sed -i.bak "s/export const version = \"[^\"]*\"/export const version = \"$ROOT_NEW_VERSION\"/g" index.ts
    rm -f index.ts.bak
    
    info "根包版本已更新到 $ROOT_NEW_VERSION"
}

# 同步 pnpm lockfile，确保 package.json 变更后锁文件一致
sync_lockfile() {
    if [ "$DRY_RUN" = true ]; then
        info "[模拟] 同步 pnpm-lock.yaml"
        return
    fi

    if [ -f "pnpm-lock.yaml" ]; then
        info "🔒 同步 pnpm-lock.yaml..."
        # 使用安装来刷新锁文件；若失败则提示但不中断流程
        if ! pnpm install > /dev/null 2>&1; then
            warn "pnpm install 同步锁文件失败，请手动运行 pnpm install 修复锁文件"
        else
            success "锁文件已同步"
        fi
    else
        warn "未检测到 pnpm-lock.yaml，跳过锁文件同步"
    fi
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
    sed -i.bak "s/export const version = \"[^\"]*\"/export const version = \"${ROOT_TARGET_VERSION:-$NEW_VERSION}\"/g" index.ts
    rm -f index.ts.bak
}

# 执行更新
info "开始执行更新..."
if [ -n "$PACKAGE_NAME" ]; then
    # 单包模式
    info "执行单包模式更新..."
    update_version "$PACKAGE_PATH" "$FULL_PACKAGE_NAME" "$NEW_VERSION"
    info "update_version 执行完成"
    update_engine_dependencies
    info "update_engine_dependencies 执行完成"
    update_widgets_dependencies
    info "update_widgets_dependencies 执行完成"
    update_root_version_for_subpackage
    info "update_root_version_for_subpackage 执行完成"
    update_version_constant
    info "update_version_constant 执行完成"
else
    # 统一模式
    info "执行统一模式更新..."
    update_version "." "根包" "${ROOT_TARGET_VERSION:-$NEW_VERSION}"
    update_version "packages/engine" "@xh-gis/engine" "${ENGINE_TARGET_VERSION:-$NEW_VERSION}"
    update_version "packages/widgets" "@xh-gis/widgets" "${WIDGETS_TARGET_VERSION:-$NEW_VERSION}"
    update_dependencies
    update_version_constant
    # 在版本号与依赖更新后，立刻同步 pnpm-lock.yaml，避免 CI 的 --frozen-lockfile 失败
    sync_lockfile
fi

success "版本更新完成！"
echo ""
info "📦 新版本："
if [ -n "$PACKAGE_NAME" ]; then
    echo "  - $FULL_PACKAGE_NAME@$NEW_VERSION"
else
    echo "  - @xh-gis/engine@${ENGINE_TARGET_VERSION:-$NEW_VERSION}"
    echo "  - @xh-gis/widgets@${WIDGETS_TARGET_VERSION:-$NEW_VERSION}"
    echo "  - xh-gis@${ROOT_TARGET_VERSION:-$NEW_VERSION}"
fi
echo ""

info "检查是否需要提交..."
if [ "$DRY_RUN" = false ]; then
    if [ "$NO_COMMIT" = false ]; then
        if [ -n "$PACKAGE_NAME" ]; then
            warn "即将更新 $FULL_PACKAGE_NAME 包版本到 $NEW_VERSION"
        else
            warn "即将更新所有包版本：root=${ROOT_TARGET_VERSION:-$NEW_VERSION}, engine=${ENGINE_TARGET_VERSION:-$NEW_VERSION}, widgets=${WIDGETS_TARGET_VERSION:-$NEW_VERSION}"
        fi
        echo ""
        
        if [ "$AUTO_CONFIRM" = true ]; then
            info "自动确认版本更新..."
        else
            echo "确定要继续吗？ (y/n)"
            # 在非交互式环境中，read 命令会阻塞，所以我们添加一个检测机制
            if [ -t 0 ]; then
                # 如果是终端输入，等待用户输入
                read -r response
                if [[ ! "$response" =~ ^[Yy]$ ]]; then
                    info "版本更新已取消"
                    exit 0
                fi
            else
                # 如果不是终端输入（如在脚本中），默认确认
                info "非交互式环境，默认确认..."
                response="y"
            fi
        fi
        
        info "📝 提交版本更改..."
        git add .
        
        # 根据是否更新了根包版本来生成不同的提交信息
        if [ -n "$PACKAGE_NAME" ] && [ "$PACKAGE_NAME" != "root" ]; then
            # 子包更新，同时更新了根包
            ROOT_CURRENT_VERSION=$(node -p "require('./package.json').version")
            git commit -m "chore($PACKAGE_NAME): bump version to $NEW_VERSION

- Update $FULL_PACKAGE_NAME to version $NEW_VERSION
- Auto-update xh-gis root package to version $ROOT_CURRENT_VERSION
- Update workspace dependencies if needed
- Update version constant if needed"
        else
            # 仅根包更新或统一模式
            git commit -m "chore($PACKAGE_NAME): bump version to $NEW_VERSION

- Update $FULL_PACKAGE_NAME to version $NEW_VERSION
- Update workspace dependencies if needed
- Update version constant if needed"
        fi
        
        success "版本更改已提交"
        echo ""
        # 构造标签名：统一模式下为每个包创建对应标签
        if [ -n "$PACKAGE_NAME" ]; then
            TAG_NAME="${PACKAGE_NAME:-root}-v$NEW_VERSION"
            info "🏷️  创建标签: $TAG_NAME"
            if git rev-parse -q --verify "refs/tags/$TAG_NAME" > /dev/null; then
                warn "标签已存在，跳过: $TAG_NAME"
            else
                git tag "$TAG_NAME" || true
                success "标签已创建: $TAG_NAME"
            fi
        else
            info "🏷️  创建统一模式标签"
            # root 标签
            ROOT_TAG="root-v${ROOT_TARGET_VERSION:-$NEW_VERSION}"
            if git rev-parse -q --verify "refs/tags/$ROOT_TAG" > /dev/null; then
                warn "标签已存在，跳过: $ROOT_TAG"
            else
                git tag "$ROOT_TAG" || true
                success "标签已创建: $ROOT_TAG"
            fi
            # engine 标签
            ENGINE_TAG="engine-v${ENGINE_TARGET_VERSION:-$NEW_VERSION}"
            if git rev-parse -q --verify "refs/tags/$ENGINE_TAG" > /dev/null; then
                warn "标签已存在，跳过: $ENGINE_TAG"
            else
                git tag "$ENGINE_TAG" || true
                success "标签已创建: $ENGINE_TAG"
            fi
            # widgets 标签
            WIDGETS_TAG="widgets-v${WIDGETS_TARGET_VERSION:-$NEW_VERSION}"
            if git rev-parse -q --verify "refs/tags/$WIDGETS_TAG" > /dev/null; then
                warn "标签已存在，跳过: $WIDGETS_TAG"
            else
                git tag "$WIDGETS_TAG" || true
                success "标签已创建: $WIDGETS_TAG"
            fi
        fi
        
        # 如果是子包更新，还需要为根包创建标签
        if [ -n "$PACKAGE_NAME" ] && [ "$PACKAGE_NAME" != "root" ]; then
            ROOT_CURRENT_VERSION=$(node -p "require('./package.json').version")
            ROOT_TAG="root-v$ROOT_CURRENT_VERSION"
            info "🏷️  创建根包标签: $ROOT_TAG"
            if git rev-parse -q --verify "refs/tags/$ROOT_TAG" > /dev/null; then
                warn "标签已存在，跳过: $ROOT_TAG"
            else
                git tag "$ROOT_TAG" || true
                success "标签已创建: $ROOT_TAG"
            fi
        fi
        
        success "标签已创建"
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
info "脚本执行完成"