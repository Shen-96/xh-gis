#!/bin/bash

# NPM镜像源管理工具
# 用于在不同registry之间切换

set -e

# 定义常用的registry地址
OFFICIAL_REGISTRY="https://registry.npmjs.org/"
TAOBAO_REGISTRY="https://registry.npmmirror.com/"
CNPM_REGISTRY="https://r.cnpmjs.org/"

show_current() {
    echo "📋 当前配置："
    echo "  NPM Registry: $(npm config get registry)"
    echo "  PNPM Registry: $(pnpm config get registry)"
    echo ""
}

show_help() {
    echo "🔧 NPM镜像源管理工具"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  official, npm     - 切换到官方源 (registry.npmjs.org)"
    echo "  taobao, cn        - 切换到淘宝镜像 (registry.npmmirror.com)"  
    echo "  cnpm              - 切换到cnpm镜像 (r.cnpmjs.org)"
    echo "  current, status   - 显示当前配置"
    echo "  test              - 测试当前源的连接速度"
    echo "  help, -h          - 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 official       # 切换到官方源"
    echo "  $0 taobao         # 切换到淘宝镜像"
    echo "  $0 current        # 查看当前配置"
    echo "  $0 test           # 测试连接速度"
}

set_registry() {
    local registry=$1
    local name=$2
    
    echo "🔄 切换到${name}源: $registry"
    npm config set registry $registry
    pnpm config set registry $registry
    echo "✅ 切换完成"
    echo ""
    show_current
}

test_registry() {
    echo "🚀 测试当前源的连接速度..."
    local current_registry=$(npm config get registry)
    echo "正在测试: $current_registry"
    echo ""
    
    # 测试连接速度
    echo "⏱️  正在测试连接..."
    local start_time=$(date +%s%N)
    
    if curl -s --connect-timeout 10 "$current_registry" > /dev/null; then
        local end_time=$(date +%s%N)
        local duration=$(( (end_time - start_time) / 1000000 ))
        echo "✅ 连接成功！响应时间: ${duration}ms"
        
        # 测试包查询
        echo "📦 测试包查询..."
        if npm view react version &> /dev/null; then
            echo "✅ 包查询正常"
        else
            echo "❌ 包查询失败"
        fi
    else
        echo "❌ 连接失败"
    fi
}

case "${1:-help}" in
    "official"|"npm")
        set_registry $OFFICIAL_REGISTRY "官方"
        ;;
    "taobao"|"cn")
        set_registry $TAOBAO_REGISTRY "淘宝镜像"
        ;;
    "cnpm")
        set_registry $CNPM_REGISTRY "CNPM镜像"
        ;;
    "current"|"status")
        show_current
        ;;
    "test")
        test_registry
        ;;
    "help"|"-h"|*)
        show_help
        ;;
esac