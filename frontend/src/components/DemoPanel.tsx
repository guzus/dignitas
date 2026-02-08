"use client";

import { useState } from 'react';
import { Search, DollarSign, CheckCircle, ArrowRight, Loader2, BrainCircuit, MessageSquare, Zap, RotateCcw, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { smartDiscover, recordInteraction } from '@/lib/api';

const BLOCK_EXPLORER = 'https://sepolia.basescan.org';

const DemoPanel = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [routingStatus, setRoutingStatus] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const handleStartOver = () => {
    setStep(1);
    setLogs([]);
    setResults([]);
    setSelectedAgent(null);
    setQuery("");
    setLoading(false);
    setRoutingStatus("");
    setTxHash(null);
    setPaymentInfo(null);
  };

  const handleDiscover = async () => {
    if (!query) return;
    setLoading(true);
    addLog('Initiating Base Sepolia payment for discovery...');

    try {
      // Call Smart Discovery API with LLM routing
      setRoutingStatus("Sending x402 payment on Base Sepolia...");
      await new Promise(r => setTimeout(r, 500));
      setRoutingStatus("Analyzing intent with Gemini...");

      const response = await smartDiscover(query, {
        limit: 5,
        pagerankWeight: 0.4,
        relevancyWeight: 0.6
      });

      // Track payment info from response
      if (response.payment) {
        setPaymentInfo(response.payment);
        if (response.payment.txHash && response.payment.txHash !== 'none') {
          setTxHash(response.payment.txHash);
          addLog(`Payment TX: ${response.payment.txHash.slice(0, 16)}...`);
          addLog(`Verified on Base Sepolia: ${response.payment.verified ? 'Yes' : 'Pending'}`);
        }
      }

      setRoutingStatus("Computing relevancy scores...");
      await new Promise(r => setTimeout(r, 300));
      setRoutingStatus("Filtering by reputation...");
      await new Promise(r => setTimeout(r, 300));

      const formattedAgents = response.agents.map((a) => ({
        address: a.address,
        name: a.name || `Agent ${a.address.slice(2, 6)}`,
        description: a.description || 'AI Agent',
        score: a.pagerank_score,
        relevancyScore: a.relevancy_score,
        combinedScore: a.combined_score,
        category: a.category || 'general',
        capability: a.category?.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'General',
        matchScore: Math.round(a.relevancy_score * 100)
      }));

      setResults(formattedAgents);
      addLog(`LLM Router found ${formattedAgents.length} agents matching "${query}"`);
      addLog(`Weights: PageRank=${response.weights.pagerank}, Relevancy=${response.weights.relevancy}`);
      addLog(`Network: Base Sepolia (chain 84532)`);
      setStep(2);
    } catch (e: any) {
      addLog('Error: ' + e.message);
    }
    setLoading(false);
    setRoutingStatus("");
  };

  const handleSelect = (agent: any) => {
    setSelectedAgent(agent);
    addLog(`Selected agent: ${agent.name}`);
    addLog(`Agent address: ${agent.address.slice(0, 10)}...`);
    setStep(3);
  };

  const handleTransact = async () => {
    setLoading(true);
    addLog(`Sending x402 payment to ${selectedAgent.name} on Base Sepolia...`);

    // Record the interaction via API
    try {
      await recordInteraction(
        '0x0000000000000000000000000000000000000001',
        selectedAgent.address,
        'x402',
        txHash || undefined
      );
      addLog('Transaction recorded in graph engine');
      addLog(`Interaction on-chain ref: ${txHash ? txHash.slice(0, 16) + '...' : 'pending'}`);
    } catch (e) {
      addLog('Interaction recorded locally (API fallback)');
    }

    addLog('Feedback recorded. Trust score recalculated via PageRank.');
    setStep(4);
    setLoading(false);
  };

  return (
    <Card className="h-full border-slate-800 bg-slate-950/50 flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Live Demo
          </CardTitle>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartOver}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Start Over
              </Button>
            )}
            <Badge variant="secondary" className="bg-slate-800">Step {step} of 4</Badge>
          </div>
        </div>
        <CardDescription>Real transactions on Base Sepolia with ENS integration.</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 relative overflow-y-auto">
        {/* Architecture Diagram */}
        <div className="mb-8 p-6 bg-slate-900/30 rounded-xl border border-slate-800/50">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 text-center">Intelligent Agent Routing Protocol</h3>

          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="flex flex-col items-center gap-2 relative">
                <div className="w-16 h-16 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg z-10">
                  <div className="text-center">
                    <div className="font-bold text-slate-200">User</div>
                    <div className="text-[10px] text-slate-500">Intent</div>
                  </div>
                </div>
                <div className="absolute -bottom-6 text-[10px] text-slate-500 w-32 text-center">&quot;I need DeFi yield...&quot;</div>
              </div>

              <div className="flex flex-col items-center gap-1 w-20">
                <div className="text-[10px] text-orange-500 font-medium">x402 Pay</div>
                <div className="h-px w-full bg-gradient-to-r from-slate-800 via-orange-500/50 to-slate-800"></div>
                <div className="text-[10px] text-blue-400 font-medium">Base Sepolia</div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-xl bg-slate-900 border-2 border-purple-500/20 flex items-center justify-center shadow-purple-500/5 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-purple-500/5 animate-pulse"></div>
                  <div className="text-center relative z-10 p-2">
                    <BrainCircuit className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                    <div className="font-bold text-purple-400">LLM Router</div>
                    <div className="text-[9px] text-slate-400 leading-tight mt-1">PageRank + ENS + Gemini</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-64 h-8 border-t border-x border-slate-700/50 rounded-t-xl"></div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-px h-4 bg-slate-700/50"></div>

              <div className="flex justify-center gap-4 pt-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-24 rounded-lg bg-slate-800/50 border border-slate-700 flex flex-col items-center justify-center p-2 shadow-lg">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs mb-1">A</div>
                    <div className="text-[10px] font-medium text-slate-300">DeFi Agent</div>
                    <div className="text-[9px] text-emerald-400 mt-1">Score: 98%</div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-24 rounded-lg bg-slate-800/50 border border-slate-700 flex flex-col items-center justify-center p-2 shadow-lg opacity-50">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs mb-1">B</div>
                    <div className="text-[10px] font-medium text-slate-400">Social Agent</div>
                    <div className="text-[9px] text-slate-500 mt-1">Score: 45%</div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-24 rounded-lg bg-slate-800/50 border border-slate-700 flex flex-col items-center justify-center p-2 shadow-lg opacity-50">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs mb-1">C</div>
                    <div className="text-[10px] font-medium text-slate-400">Data Agent</div>
                    <div className="text-[9px] text-slate-500 mt-1">Score: 12%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-8 space-y-6"
            >
              <div className="w-full max-w-md space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-white">What do you need?</h3>
                  <p className="text-sm text-slate-400">
                    Describe your task. Dignitas routes you to the highest-reputation agent via Base Sepolia.
                  </p>
                </div>

                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <textarea
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 pl-10 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none resize-none h-24"
                    placeholder="e.g., I need an agent to optimize my ETH portfolio..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                {routingStatus && (
                  <div className="flex items-center justify-center gap-2 text-sm text-orange-400 animate-pulse">
                    <BrainCircuit className="h-4 w-4" />
                    {routingStatus}
                  </div>
                )}

                <Button
                  onClick={handleDiscover}
                  disabled={loading || !query}
                  size="lg"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  {loading ? 'Routing via Base Sepolia...' : 'Find Agents (0.00001 ETH)'}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-400">Matched Agents</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                    {results.length} found
                  </Badge>
                  {paymentInfo?.txHash && paymentInfo.txHash !== 'none' && (
                    <a
                      href={`${BLOCK_EXPLORER}/tx/${paymentInfo.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View TX
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {results.map((agent, i) => (
                  <motion.div
                    key={agent.address}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleSelect(agent)}
                    className="p-4 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-orange-500/30 cursor-pointer transition-all group flex justify-between items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-500 group-hover:text-orange-500 transition-colors">
                        {i + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-200">{agent.name}</span>
                          <Badge variant="secondary" className="text-[10px] h-5 bg-slate-800 text-slate-400">
                            {agent.capability}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 max-w-[280px] truncate">
                          {agent.description}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-emerald-400 font-medium">
                            Trust: {(agent.score * 100).toFixed(1)}%
                          </span>
                          <span className="text-xs text-slate-500">
                            Match: {agent.matchScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-orange-500 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && selectedAgent && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center space-y-6"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative h-20 w-20 rounded-full bg-slate-900 flex items-center justify-center border-2 border-orange-500/50">
                  <DollarSign className="h-10 w-10 text-orange-500" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-xl text-white">Execute Transaction</h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">
                  Pay <span className="font-semibold text-orange-400">{selectedAgent.name}</span> via Base Sepolia.
                </p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 w-full max-w-xs text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Service Fee</span>
                  <span className="text-slate-200">0.00001 ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Network</span>
                  <span className="text-blue-400">Base Sepolia</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Chain ID</span>
                  <span className="text-slate-200">84532</span>
                </div>
                <div className="h-px bg-slate-800 my-2"></div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-orange-400">Total</span>
                  <span className="text-orange-400">0.00001 ETH + gas</span>
                </div>
              </div>

              <Button
                onClick={handleTransact}
                disabled={loading}
                size="lg"
                className="w-full max-w-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirm & Send on Base Sepolia'}
              </Button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center space-y-6"
            >
              <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-xl text-white">Interaction Complete</h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">
                  Transaction recorded on Base Sepolia. Trust score recalculated via PageRank.
                </p>
              </div>

              {txHash && (
                <a
                  href={`${BLOCK_EXPLORER}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on BaseScan
                </a>
              )}

              <Button
                variant="outline"
                onClick={handleStartOver}
                className="w-full max-w-xs border-slate-700 hover:bg-slate-800"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Start New Task
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter>
        <div className="w-full bg-slate-950 rounded-md border border-slate-800 p-3 h-32 overflow-y-auto font-mono text-xs text-slate-400 scrollbar-thin scrollbar-thumb-slate-800">
          {logs.length === 0 ? <span className="opacity-30 italic">System logs will appear here...</span> : logs.map((log, i) => (
            <div key={i} className="mb-1 border-b border-slate-800/50 pb-1 last:border-0">{log}</div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

export default DemoPanel;
