import { DignitasClient } from '../client/dignitas-client';
import 'dotenv/config';

async function runDemo() {
  console.log('\n🚀 DIGNITAS DEMO\n');
  console.log('═'.repeat(50));

  if (!process.env.PRIVATE_KEY) {
    console.error("Error: PRIVATE_KEY not found in environment variables.");
    process.exit(1);
  }

  const client = new DignitasClient(process.env.PRIVATE_KEY!);

  // Step 1: Show current leaderboard (FREE)
  console.log('\n📊 Current Leaderboard (FREE):');
  try {
    const leaderboard = await client.getLeaderboard();
    leaderboard.slice(0, 5).forEach((a, i) => {
      console.log(`   ${i + 1}. ${a.address.slice(0, 10)}... → ${(a.score * 100).toFixed(1)}%`);
    });

    // Step 2: Discover trusted agents (PAID - $0.001)
    console.log('\n🔍 Discovering agents with score >= 0.7 (PAID $0.001):');
    const trusted = await client.discover(0.7, 3);
    trusted.forEach((a, i) => {
      console.log(`   ${i + 1}. ${a.address.slice(0, 10)}... → ${(a.score * 100).toFixed(1)}%`);
    });

    if (trusted.length > 0) {
      // Step 3: Get specific score (PAID - $0.001)
      const topAgent = trusted[0];
      console.log(`\n🎯 Selected: ${topAgent.address.slice(0, 10)}...`);
      const score = await client.getScore(topAgent.address);
      console.log(`   Trust Score: ${(score * 100).toFixed(1)}%`);

      // Step 4: Simulate transaction + feedback
      console.log('\n💸 Simulating x402 payment to agent...');
      console.log('   [In production: actual x402 payment here]');

      console.log('\n✅ Recording feedback...');
      // await client.recordInteraction(topAgent.address, 'x402');
    } else {
      console.log("\nNo trusted agents found to query.");
    }

  } catch (error) {
    console.error("Error running demo:", error);
  }

  console.log('\n═'.repeat(50));
  console.log('DEMO COMPLETE');
  console.log(`Total x402 payments: 2 ($0.001 query + $X transaction)`);
  console.log('═'.repeat(50));
}

runDemo();
