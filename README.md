# PrivyMiles - FHEVM Fitness Tracking dApp

A decentralized fitness tracking application built with **FHEVM (Fully Homomorphic Encryption Virtual Machine)** that allows users to submit and track their fitness activities with **end-to-end encryption**.

## 🌟 Features

- ✅ **Encrypted Activity Submission** - Submit steps, minutes, and calories with full encryption
- ✅ **Privacy-Preserving Leaderboard** - Compete with others while keeping your data private
- ✅ **Decentralized Badges** - Earn achievement badges stored on-chain
- ✅ **MetaMask Integration** - Seamless wallet connection with EIP-6963 support
- ✅ **Responsive Design** - Beautiful UI that works on desktop and mobile
- ✅ **Sepolia Testnet Ready** - Deployed and tested on Ethereum Sepolia

## 🏗️ Project Structure

```
.
├── fhevm-hardhat-template/    # Smart contracts (Solidity + FHEVM)
│   ├── contracts/             # FitnessLeaderboard.sol
│   ├── deploy/                # Deployment scripts
│   ├── tasks/                 # Hardhat tasks
│   └── test/                  # Contract tests
│
└── privymiles-frontend/       # Next.js frontend
    ├── app/                   # Pages (submit, leaderboard, badges, stats)
    ├── components/            # UI components
    ├── fhevm/                 # FHEVM integration
    ├── hooks/                 # React hooks
    └── public/                # Static assets (WASM files)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Sepolia testnet ETH ([get from faucet](https://sepoliafaucet.com/))

### 1. Clone the Repository

```bash
git clone https://github.com/CashRussell/privymiles-fhevm-fitness.git
cd privymiles-fhevm-fitness
```

### 2. Install Dependencies

```bash
# Install Hardhat dependencies
cd fhevm-hardhat-template
npm install

# Install frontend dependencies
cd ../privymiles-frontend
npm install
```

### 3. Run Frontend (Development)

```bash
cd privymiles-frontend

# For Sepolia testnet (real relayer)
npm run dev

# For local Hardhat node (mock mode)
npm run dev:mock
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Deploy Contracts (Optional)

If you want to deploy your own contract instance:

```bash
cd fhevm-hardhat-template

# Deploy to Sepolia
npx hardhat deploy --network sepolia

# Deploy to localhost (requires running Hardhat node)
npx hardhat node  # In one terminal
npx hardhat deploy --network localhost  # In another terminal
```

## 📦 Tech Stack

### Smart Contracts
- **Solidity** - Smart contract language
- **FHEVM** - Fully Homomorphic Encryption support
- **Hardhat** - Development environment
- **@fhevm/solidity** v0.9.1 - FHEVM library (latest stable)

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS
- **shadcn/ui** - UI component library
- **ethers.js v6** - Ethereum interactions
- **@zama-fhe/relayer-sdk** 0.3.0-5 - FHEVM client library (updated)

## 🔐 FHEVM Integration

This project uses **Zama's FHEVM** to enable computation on encrypted data:

1. **Client-side encryption** - User data is encrypted in the browser
2. **On-chain computation** - Smart contracts process encrypted data without decrypting
3. **Selective decryption** - Only authorized users can decrypt specific data

### Encrypted Data Types

- `euint16` - Steps count (up to 65,535)
- `euint8` - Minutes and calories (up to 255)
- `euint32` - Total aggregated values

## 🌐 Deployment

### Live Demo
- **Frontend**: [https://privymiles-frontend.vercel.app](https://privymiles-frontend.vercel.app)
- **Network**: Sepolia Testnet
- **Contract**: `0x895D6cBBD550A0EE7eB209cA8d6351ac8A69c6cD`

### Deploy Your Own

#### Vercel Deployment

1. Fork this repository
2. Connect to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_CHAIN_ID=11155111`
4. Deploy!

Or use the CLI:

```bash
cd privymiles-frontend
npm run build  # Verify build works
vercel --prod
```

## 🧪 Testing

### Smart Contracts

```bash
cd fhevm-hardhat-template
npx hardhat compile
npx hardhat test
```

### Frontend

```bash
cd privymiles-frontend
npm run build  # Static export test
npm run check:static  # Verify no SSR usage
```

## 📄 Smart Contract API

### `submitActivity(euint16 steps, euint8 minutes, euint8 calories)`
Submit encrypted fitness activity data.

### `getTotalActivities() → uint256`
Get the total number of activities submitted (public).

### `getLeaderboard(uint256 limit) → address[]`
Get top participants by total activities (public addresses).

### `requestDecryption(euint32 encryptedValue) → uint256`
Request decryption of an encrypted value (requires permission).

## 🔧 Configuration

### Frontend Config (`privymiles-frontend/.env.local`)

```env
NEXT_PUBLIC_CHAIN_ID=11155111  # Sepolia
```

### Hardhat Config

Networks configured in `fhevm-hardhat-template/hardhat.config.ts`:
- `localhost` (31337) - Local development
- `sepolia` (11155111) - Testnet deployment

## 🛠️ Development Scripts

### Frontend

```bash
npm run dev          # Start dev server (Sepolia)
npm run dev:mock     # Start dev server (localhost + mock)
npm run build        # Build for production
npm run genabi       # Generate ABI from contract deployments
npm run check:static # Verify static export compatibility
```

### Contracts

```bash
npx hardhat compile  # Compile contracts
npx hardhat test     # Run tests
npx hardhat deploy   # Deploy contracts
npx hardhat node     # Start local node
```

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama GitHub](https://github.com/zama-ai)
- [Next.js Docs](https://nextjs.org/docs)
- [Hardhat Docs](https://hardhat.org/docs)

## 🐛 Troubleshooting

### "Contract not deployed" Error
- Ensure you're on the correct network (Sepolia or localhost)
- Check that ABI files are up to date (`npm run genabi`)

### FHEVM Initialization Fails
- Check browser console for errors
- Verify WASM files are loaded correctly
- Ensure MetaMask is connected

### Build Fails on Vercel
- Verify all files are committed to Git
- Check that `abi/` directory contains valid files
- Review build logs on Vercel dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

This project is open source and available under the MIT License.

## 🔗 Links

- **GitHub**: [https://github.com/CashRussell/privymiles-fhevm-fitness](https://github.com/CashRussell/privymiles-fhevm-fitness)
- **Live Demo**: [https://privymiles-frontend.vercel.app](https://privymiles-frontend.vercel.app)
- **Zama Website**: [https://www.zama.ai](https://www.zama.ai)

## 👤 Author

**CashRussell**
- GitHub: [@CashRussell](https://github.com/CashRussell)

---

**Built with ❤️ using FHEVM and Next.js**

