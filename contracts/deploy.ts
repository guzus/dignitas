/**
 * Deploy DignitasProtocol to Base Sepolia using viem.
 *
 * Usage:
 *   PRIVATE_KEY=0x... TREASURY_ADDRESS=0x... npx tsx contracts/deploy.ts
 *
 * Prerequisites:
 *   - Fund the deployer address with Base Sepolia ETH from https://www.base.org/faucet
 */
import {
  createWalletClient,
  createPublicClient,
  http,
  parseEther,
  encodeFunctionData,
} from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { DIGNITAS_PROTOCOL_ABI, QUERY_PRICE_WEI } from "./abi";
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";

// Compiled bytecode of DignitasProtocol.sol
// To get this: compile with solc 0.8.20+ and paste the bytecode here.
// For hackathon: you can compile at https://remix.ethereum.org and paste the bytecode.
//
// Placeholder - replace with actual compiled bytecode before deploying:
const BYTECODE = process.env.CONTRACT_BYTECODE as `0x${string}`;

async function main() {
  const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    console.error("PRIVATE_KEY env var required");
    process.exit(1);
  }

  const treasuryAddress = (process.env.TREASURY_ADDRESS ||
    "0x0000000000000000000000000000000000000000") as `0x${string}`;

  if (!BYTECODE) {
    console.error("CONTRACT_BYTECODE env var required (compiled Solidity bytecode)");
    console.error("Compile DignitasProtocol.sol with solc or Remix and set the bytecode.");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http("https://sepolia.base.org"),
  });
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http("https://sepolia.base.org"),
  });

  console.log("Deploying DignitasProtocol...");
  console.log(`  Deployer: ${account.address}`);
  console.log(`  Treasury: ${treasuryAddress}`);
  console.log(`  Query Price: ${QUERY_PRICE_WEI} wei (0.00001 ETH)`);
  console.log(`  Network: Base Sepolia (${baseSepolia.id})`);

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`  Balance: ${balance} wei`);

  if (balance === 0n) {
    console.error("Deployer has no ETH. Get testnet ETH from https://www.base.org/faucet");
    process.exit(1);
  }

  // Deploy
  const hash = await walletClient.deployContract({
    abi: DIGNITAS_PROTOCOL_ABI,
    bytecode: BYTECODE,
    args: [treasuryAddress, QUERY_PRICE_WEI],
  });

  console.log(`  TX Hash: ${hash}`);
  console.log("  Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const contractAddress = receipt.contractAddress!;

  console.log(`\n  Contract deployed at: ${contractAddress}`);
  console.log(`  Block: ${receipt.blockNumber}`);
  console.log(`  Gas Used: ${receipt.gasUsed}`);
  console.log(`  Explorer: https://sepolia.basescan.org/address/${contractAddress}`);

  // Save deployment info
  const deploymentInfo = {
    chainId: baseSepolia.id,
    contractAddress,
    treasury: treasuryAddress,
    deployer: account.address,
    txHash: hash,
    blockNumber: receipt.blockNumber.toString(),
    blockExplorer: "https://sepolia.basescan.org",
    rpcUrl: "https://sepolia.base.org",
    deployedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "deployments.json");
  fs.writeFileSync(outPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n  Deployment saved to ${outPath}`);
  console.log("\n  Update contracts/abi.ts DEPLOYMENTS with the new address.");
}

main().catch(console.error);
