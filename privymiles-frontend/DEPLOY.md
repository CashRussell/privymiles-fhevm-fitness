# 快速部署到 Vercel

## 🚀 一键准备脚本

```bash
./scripts/prepare-deployment.sh
```

此脚本会自动：
- ✅ 生成 ABI 文件
- ✅ 检查 WASM 文件
- ✅ 验证配置文件
- ✅ 测试本地构建
- ✅ 显示部署清单

---

## 📦 手动部署步骤

### 1. 准备文件

```bash
# 生成 ABI
node scripts/genabi.mjs

# 测试构建
npm run build
```

### 2. 提交到 Git

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

### 3. 部署到 Vercel

#### 方法 A: Dashboard（推荐新手）

1. 访问 [vercel.com/new](https://vercel.com/new)
2. 导入 GitHub 仓库
3. 配置：
   - **Root Directory**: `privymiles-frontend`
   - **Framework**: Next.js
   - **Environment Variables**:
     - `NEXT_PUBLIC_CHAIN_ID` = `11155111`

#### 方法 B: CLI（推荐熟练用户）

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

---

## 🔧 必需的环境变量

在 Vercel Dashboard 中设置：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_CHAIN_ID` | `11155111` | Sepolia 测试网 |
| `NODE_ENV` | `production` | 生产环境 |

---

## ✅ 部署后验证

1. **访问网站**: `https://your-project.vercel.app`
2. **打开控制台**（F12）检查：
   - ✅ WASM 文件加载成功
   - ✅ FHEVM 实例创建成功
   - ✅ 无错误日志
3. **连接 MetaMask**（Sepolia 网络）
4. **测试提交数据**

---

## 🐛 常见问题

### 构建失败：找不到 ABI 文件

**解决**：将 ABI 文件提交到 Git
```bash
git add abi/
git commit -m "Add ABI files"
git push
```

### WASM 文件 404

**解决**：将 WASM 文件提交到 Git
```bash
git add public/*.wasm public/relayer-sdk-js.umd.cjs
git commit -m "Add WASM files"
git push
```

### MetaMask 连接后无法初始化

**检查**：
1. 环境变量 `NEXT_PUBLIC_CHAIN_ID=11155111` 是否设置
2. MetaMask 是否连接到 Sepolia 网络
3. 控制台是否有错误日志

---

## 📖 完整文档

详细部署指南请查看：[VERCEL_DEPLOYMENT_GUIDE.md](../VERCEL_DEPLOYMENT_GUIDE.md)

---

## 🆘 需要帮助？

- [Vercel 文档](https://vercel.com/docs)
- [FHEVM 文档](https://docs.zama.ai/fhevm)
- [Zama Discord](https://discord.fhe.org)



