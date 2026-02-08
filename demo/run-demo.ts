import { DignitasClient } from '../client/dignitas-client';
import 'dotenv/config';

async function runDemo() {
  console.log('\n  DIGNITAS DEMO - Base Sepolia + ENS\n');
  console.log('='.repeat(60));

  if (!process.env.PRIVATE_KEY) {
    console.error("Error: PRIVATE_KEY not found in environment variables.");
    console.error("Set PRIVATE_KEY to a Base Sepolia funded wallet.");
    console.error("Get testnet ETH: https://www.base.org/faucet");
    process.exit(1);
  }

  const client = new DignitasClient(process.env.PRIVATE_KEY!, undefined, {
    treasuryAddress: process.env.TREASURY_ADDRESS,
    contractAddress: process.env.CONTRACT_ADDRESS,
  });

  console.log(`\nWallet: ${client.address}`);

  // Check balance
  const balance = await client.getBalance();
  console.log(`Balance: ${balance} ETH (Base Sepolia)`);

  if (parseFloat(balance) === 0) {
    console.error("\nInsufficient balance. Get testnet ETH from https://www.base.org/faucet");
    process.exit(1);
  }

  // Step 1: Show current leaderboard (FREE - no payment required)
  console.log('\n--- Step 1: Leaderboard (FREE) ---');
  try {
    const leaderboard = await client.getLeaderboard();
    leaderboard.slice(0, 5).forEach((a, i) => {
      console.log(`  ${i + 1}. ${a.address.slice(0, 10)}... -> ${(a.score * 100).toFixed(1)}%`);
    });
  } catch (e: any) {
    console.error('  Leaderboard fetch failed:', e.message);
  }

  // Step 2: Discover trusted agents (PAID - sends real ETH on Base Sepolia)
  console.log('\n--- Step 2: Discover agents (PAID - 0.00001 ETH) ---');
  console.log('  Sending real ETH to treasury on Base Sepolia...');
  try {
    const trusted = await client.discover(0.7, 3);
    trusted.forEach((a, i) => {
      console.log(`  ${i + 1}. ${a.address.slice(0, 10)}... -> ${(a.score * 100).toFixed(1)}%`);
    });

    if (trusted.length > 0) {
      // Step 3: Get specific score (PAID)
      const topAgent = trusted[0];
      console.log(`\n--- Step 3: Agent Score Lookup (PAID - 0.00001 ETH) ---`);
      console.log(`  Querying: ${topAgent.address.slice(0, 10)}...`);
      const score = await client.getScore(topAgent.address);
      console.log(`  Trust Score: ${(score * 100).toFixed(1)}%`);

      // Step 4: Record interaction (PAID + on-chain recording)
      console.log('\n--- Step 4: Record Interaction (PAID + on-chain) ---');
      console.log(`  Recording x402 payment to ${topAgent.address.slice(0, 10)}...`);
      const { paymentTxHash, interactionTxHash } = await client.recordInteraction(
        topAgent.address,
        'x402'
      );
      console.log(`  Payment TX: ${paymentTxHash}`);
      console.log(`  Explorer: https://sepolia.basescan.org/tx/${paymentTxHash}`);
      if (interactionTxHash) {
        console.log(`  On-chain interaction TX: ${interactionTxHash}`);
      }
    }
  } catch (e: any) {
    console.error('  Discovery failed:', e.message);
  }

  // Step 5: ENS Resolution demo
  console.log('\n--- Step 5: ENS Resolution ---');
  try {
    const vitalikEns = await client.resolveEns('vitalik.eth');
    console.log(`  vitalik.eth -> ${vitalikEns || 'not resolved'}`);

    const ensName = await client.getEnsName(client.address);
    console.log(`  ${client.address.slice(0, 10)}... -> ${ensName || 'no ENS name'}`);
  } catch (e: any) {
    console.log(`  ENS resolution: ${e.message}`);
  }

  // Summary
  const finalBalance = await client.getBalance();
  console.log('\n' + '='.repeat(60));
  console.log('DEMO COMPLETE');
  console.log(`  Network: Base Sepolia (chain 84532)`);
  console.log(`  Starting balance: ${balance} ETH`);
  console.log(`  Ending balance: ${finalBalance} ETH`);
  console.log(`  ETH spent: ${(parseFloat(balance) - parseFloat(finalBalance)).toFixed(8)} ETH`);
  console.log(`  Real transactions: Yes (Base Sepolia)`);
  console.log(`  ENS integration: Yes (mainnet resolution)`);
  console.log('='.repeat(60));
}

runDemo();
