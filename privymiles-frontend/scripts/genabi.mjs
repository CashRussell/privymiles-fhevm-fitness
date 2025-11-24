#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = path.resolve(process.cwd(), '..', 'fhevm-hardhat-template', 'deployments');
const outDir = path.resolve(process.cwd(), 'abi');
fs.mkdirSync(outDir, { recursive: true });

const networks = fs.existsSync(root) ? fs.readdirSync(root).filter((d) => fs.statSync(path.join(root, d)).isDirectory()) : [];
const artifacts = {};
for (const net of networks) {
  const p = path.join(root, net, 'FitnessLeaderboard.json');
  if (fs.existsSync(p)) {
    const json = JSON.parse(fs.readFileSync(p, 'utf8'));
    artifacts[net] = { address: json.address };
    fs.writeFileSync(
      path.join(outDir, 'FitnessLeaderboardABI.ts'),
      `export const FitnessLeaderboardABI = ${JSON.stringify(json.abi)} as const;\n`,
    );
  }
}
fs.writeFileSync(
  path.join(outDir, 'FitnessLeaderboardAddresses.ts'),
  `export const FitnessLeaderboardAddresses = ${JSON.stringify(artifacts, null, 2)} as const;\n`,
);
console.log('[genabi] Generated ABI and addresses for networks:', Object.keys(artifacts));




