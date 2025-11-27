"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Search, DollarSign, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DemoPanel = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const handleDiscover = async () => {
    setLoading(true);
    addLog('Initiating x402 payment for discovery...');
    try {
      // Simulate payment delay
      await new Promise(r => setTimeout(r, 1500));
      addLog('Payment confirmed: $0.001 (USDC)');
      
      const { data } = await axios.get('http://localhost:3000/leaderboard'); // Using free endpoint for demo simulation
      setResults(data.agents.slice(0, 3));
      addLog(`Found ${data.agents.length} agents. Showing top 3.`);
      setStep(2);
    } catch (e: any) {
      addLog('Error: ' + e.message);
    }
    setLoading(false);
  };

  const handleSelect = (agent: any) => {
    setSelectedAgent(agent);
    addLog(`Selected agent: ${agent.address.slice(0, 8)}...`);
    setStep(3);
  };

  const handleTransact = async () => {
    setLoading(true);
    addLog(`Sending x402 payment to ${selectedAgent.address.slice(0, 8)}...`);
    await new Promise(r => setTimeout(r, 2000));
    addLog('Transaction successful!');
    addLog('Recording feedback on-chain...');
    await new Promise(r => setTimeout(r, 1000));
    addLog('Feedback recorded. Trust score updated.');
    setStep(4);
    setLoading(false);
  };

  return (
    <Card className="h-full border-slate-800 bg-slate-950/50 flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Live Demo</CardTitle>
          <Badge variant="secondary">Step {step} of 4</Badge>
        </div>
        <CardDescription>Simulate the x402 payment and reputation flow.</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        {step === 1 && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Discover Trusted Agents</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Find high-reputation agents for your task.
                <br /><span className="text-orange-500 font-medium">Cost: $0.001 (x402)</span>
              </p>
            </div>
            <Button onClick={handleDiscover} disabled={loading} size="lg" className="w-full max-w-xs">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" />}
              {loading ? 'Processing...' : 'Pay & Discover'}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Select an Agent</h3>
            <div className="space-y-3">
              {results.map(agent => (
                <div 
                  key={agent.address}
                  onClick={() => handleSelect(agent)}
                  className="p-4 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700 cursor-pointer transition-all group flex justify-between items-center"
                >
                  <div>
                    <div className="font-mono text-sm text-slate-200">{agent.address.slice(0, 10)}...</div>
                    <div className="text-xs text-muted-foreground mt-1">Trust Score: {(agent.score * 100).toFixed(1)}%</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && selectedAgent && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Pay Agent</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Interact with <span className="font-mono text-xs">{selectedAgent.address.slice(0, 8)}...</span>
                <br />This will increase their reputation.
              </p>
            </div>
            <Button onClick={handleTransact} disabled={loading} size="lg" className="w-full max-w-xs bg-green-600 hover:bg-green-700">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Pay & Execute'}
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Interaction Complete</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                The network has been updated with your feedback.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setStep(1);
                setLogs([]);
                setResults([]);
                setSelectedAgent(null);
              }}
              className="w-full max-w-xs"
            >
              Start Over
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <div className="w-full bg-slate-950 rounded-md border border-slate-800 p-3 h-32 overflow-y-auto font-mono text-xs text-slate-400">
          {logs.length === 0 ? <span className="opacity-50">System logs will appear here...</span> : logs.map((log, i) => (
            <div key={i} className="mb-1">{log}</div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

export default DemoPanel;
