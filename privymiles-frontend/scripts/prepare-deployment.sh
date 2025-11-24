#!/bin/bash

# Vercel 部署准备脚本
# 用途：确保所有必需文件都已准备好并提交到 Git

set -e

echo "🚀 开始准备 Vercel 部署..."
echo ""

# 1. 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在 privymiles-frontend 目录下运行此脚本"
    exit 1
fi

echo "✅ 当前目录正确"

# 2. 生成 ABI 文件
echo ""
echo "📝 生成 ABI 文件..."
node scripts/genabi.mjs

if [ ! -f "abi/FitnessLeaderboardABI.ts" ]; then
    echo "❌ 错误：ABI 文件生成失败"
    exit 1
fi

echo "✅ ABI 文件已生成"

# 3. 检查 WASM 文件
echo ""
echo "🔍 检查 WASM 文件..."

WASM_FILES=(
    "public/tfhe_bg.wasm"
    "public/kms_lib_bg.wasm"
    "public/relayer-sdk-js.umd.cjs"
)

for file in "${WASM_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 缺少文件: $file"
        echo "   请运行以下命令复制文件："
        echo "   cp node_modules/@zama-fhe/relayer-sdk/dist/*.wasm public/"
        echo "   curl -o public/relayer-sdk-js.umd.cjs https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs"
        exit 1
    fi
    echo "✅ $file 存在"
done

# 4. 检查配置文件
echo ""
echo "🔍 检查配置文件..."

CONFIG_FILES=(
    "vercel.json"
    "next.config.mjs"
    ".gitignore"
)

for file in "${CONFIG_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 缺少配置文件: $file"
        exit 1
    fi
    echo "✅ $file 存在"
done

# 5. 测试构建
echo ""
echo "🏗️  测试本地构建..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请修复错误后再部署"
    exit 1
fi

echo "✅ 构建成功"

# 6. 检查 Git 状态
echo ""
echo "📦 检查 Git 状态..."

if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "⚠️  警告：当前目录不是 Git 仓库"
    echo "   请先初始化 Git 仓库："
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
else
    echo "✅ Git 仓库已初始化"
    
    # 显示未提交的文件
    if [ -n "$(git status --porcelain)" ]; then
        echo ""
        echo "⚠️  以下文件尚未提交："
        git status --short
        echo ""
        echo "   建议运行："
        echo "   git add ."
        echo "   git commit -m 'Prepare for Vercel deployment'"
        echo "   git push"
    else
        echo "✅ 所有文件已提交"
    fi
fi

# 7. 显示部署清单
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Vercel 部署清单"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 必需文件已准备："
echo "   • abi/FitnessLeaderboardABI.ts"
echo "   • abi/FitnessLeaderboardAddresses.ts"
echo "   • public/tfhe_bg.wasm"
echo "   • public/kms_lib_bg.wasm"
echo "   • public/relayer-sdk-js.umd.cjs"
echo "   • vercel.json"
echo "   • next.config.mjs"
echo ""
echo "📝 Vercel 配置建议："
echo "   • Root Directory: privymiles-frontend"
echo "   • Framework: Next.js"
echo "   • Build Command: node ./scripts/genabi.mjs && npm run build"
echo "   • Output Directory: .next"
echo ""
echo "🔧 环境变量设置："
echo "   • NEXT_PUBLIC_CHAIN_ID=11155111"
echo "   • NODE_ENV=production"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 准备完成！现在可以部署到 Vercel："
echo ""
echo "   方法 1 (推荐): 通过 Vercel Dashboard"
echo "   1. 访问 https://vercel.com/new"
echo "   2. 导入你的 GitHub 仓库"
echo "   3. 设置 Root Directory 为 'privymiles-frontend'"
echo "   4. 添加环境变量"
echo "   5. 点击 Deploy"
echo ""
echo "   方法 2: 通过 Vercel CLI"
echo "   1. npm install -g vercel"
echo "   2. vercel login"
echo "   3. vercel --prod"
echo ""
echo "📖 详细指南请查看: ../VERCEL_DEPLOYMENT_GUIDE.md"
echo ""



