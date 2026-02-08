// Auto-derived ABI from DignitasProtocol.sol
// This file is used by the API, client SDK, and frontend to interact with the contract.

export const DIGNITAS_PROTOCOL_ABI = [
  {
    inputs: [
      { name: "_treasury", type: "address" },
      { name: "_queryPrice", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "agent", type: "address" },
      { indexed: false, name: "name", type: "string" },
      { indexed: false, name: "description", type: "string" },
    ],
    name: "AgentRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "payer", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: true, name: "paymentId", type: "bytes32" },
    ],
    name: "QueryPaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "AgentPaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "interactionType", type: "string" },
      { indexed: true, name: "txRef", type: "bytes32" },
    ],
    name: "InteractionRecorded",
    type: "event",
  },
  {
    inputs: [
      { name: "_name", type: "string" },
      { name: "_description", type: "string" },
    ],
    name: "registerAgent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "payForQuery",
    outputs: [{ name: "paymentId", type: "bytes32" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "_to", type: "address" }],
    name: "payAgent",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "_to", type: "address" },
      { name: "_interactionType", type: "string" },
    ],
    name: "recordInteraction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_addr", type: "address" }],
    name: "getAgent",
    outputs: [
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "registered", type: "bool" },
      { name: "totalReceived", type: "uint256" },
      { name: "totalSent", type: "uint256" },
      { name: "interactionCount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAgentCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "agents",
    outputs: [
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "registered", type: "bool" },
      { name: "totalReceived", type: "uint256" },
      { name: "totalSent", type: "uint256" },
      { name: "interactionCount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "registeredAgents",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "treasury",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "queryPrice",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_price", type: "uint256" }],
    name: "setQueryPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_treasury", type: "address" }],
    name: "setTreasury",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Base Sepolia deployment addresses
// Update these after deploying the contract
export const DEPLOYMENTS = {
  baseSepolia: {
    chainId: 84532,
    contractAddress: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    treasury: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    blockExplorer: "https://sepolia.basescan.org",
    rpcUrl: "https://sepolia.base.org",
  },
} as const;

// Query price: 0.00001 ETH (~$0.001 at typical ETH prices)
export const QUERY_PRICE_WEI = 10000000000000n; // 0.00001 ETH = 10^13 wei
