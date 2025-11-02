#!/usr/bin/env node
import http from 'http';

function jsonRpc(method, params = []) {
  return JSON.stringify({ jsonrpc: '2.0', id: 1, method, params });
}

function request(payload) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: '127.0.0.1', port: 8545, path: '/', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      },
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

try {
  const res = await request(jsonRpc('eth_chainId'));
  if (!res?.result) throw new Error('no result');
  console.log(`[dev:mock] Hardhat node detected, chainId=${parseInt(res.result, 16)}`);
} catch (e) {
  console.error('\n\n[dev:mock] Local Hardhat Node is not running at http://127.0.0.1:8545');
  console.error('Start it with:');
  console.error('  cd ../fhevm-hardhat-template && npx hardhat node --verbose');
  process.exit(1);
}




