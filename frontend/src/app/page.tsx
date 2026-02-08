"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Network, Activity, Zap, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TrustGraph from '@/components/TrustGraph';
import Leaderboard from '@/components/Leaderboard';
import DemoPanel from '@/components/DemoPanel';
import { fetchLeaderboard, fetchGraphData } from '@/lib/api';
import { mockLeaderboard, mockGraphData } from '@/data/mockData';

// Set to true for standalone frontend deployment (no backend required)
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export default function Home() {
  const [graphData, setGraphData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Use mock data for standalone deployment
      if (USE_MOCK_DATA) {
        console.log("Using mock data for standalone demo");
        setLeaderboard(mockLeaderboard);
        setGraphData(mockGraphData);
        setLoading(false);
        return;
      }

      // Fetch from API with automatic fallback to mock data
      const [agents, graph] = await Promise.all([
        fetchLeaderboard(),
        fetchGraphData()
      ]);

      setLeaderboard(agents);
      setGraphData(graph);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data on any error
      setLeaderboard(mockLeaderboard);
      setGraphData(mockGraphData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (!isPaused) {
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">DIGNITAS</h1>
              <p className="text-xs text-muted-foreground">Reputation Layer for AI Agents</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 gap-1.5 py-1.5">
              ENS
            </Badge>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Base Sepolia
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 h-full flex flex-col space-y-6">
            <Tabs defaultValue="graph" className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="grid w-[400px] grid-cols-3">
                  <TabsTrigger value="graph" className="gap-2"><Network className="h-4 w-4"/> Trust Graph</TabsTrigger>
                  <TabsTrigger value="demo" className="gap-2"><Zap className="h-4 w-4"/> Live Demo</TabsTrigger>
                  <TabsTrigger value="algo" className="gap-2"><Activity className="h-4 w-4"/> Algorithm</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="graph" className="flex-1 mt-0 h-full">
                <TrustGraph 
                  data={graphData} 
                  isPaused={isPaused} 
                  onTogglePause={() => setIsPaused(!isPaused)}
                  selectedAgent={selectedAgent}
                  onSelectAgent={setSelectedAgent}
                />
              </TabsContent>

              <TabsContent value="demo" className="flex-1 mt-0 h-full">
                <DemoPanel />
              </TabsContent>

              <TabsContent value="algo" className="flex-1 mt-0 h-full">
                <Card className="h-full border-slate-800 bg-slate-950/50">
                  <CardHeader>
                    <CardTitle>PageRank Algorithm</CardTitle>
                    <CardDescription>The mathematical foundation of trust in Dignitas.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="p-8 rounded-lg bg-slate-900 border border-slate-800 text-center">
                      <code className="text-xl font-mono text-primary">
                        PR(A) = (1-d) + d × Σ(PR(Ti) × W / C)
                      </code>
                    </div>

                    <div className="grid gap-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Info className="h-4 w-4" /> Variable Reference
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
                          <div className="font-mono text-sm text-primary mb-1">PR(A)</div>
                          <div className="text-sm font-medium">PageRank Score</div>
                          <div className="text-xs text-muted-foreground">Trust score (0.0 - 1.0)</div>
                        </div>
                        <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
                          <div className="font-mono text-sm text-primary mb-1">d</div>
                          <div className="text-sm font-medium">Damping Factor</div>
                          <div className="text-xs text-muted-foreground">Typically 0.85</div>
                        </div>
                        <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
                          <div className="font-mono text-sm text-primary mb-1">W</div>
                          <div className="text-sm font-medium">Edge Weight</div>
                          <div className="text-xs text-muted-foreground mb-1">
                            <span className="text-emerald-500">Positive (1.2)</span> vs 
                            <span className="text-red-500 ml-1">Negative (-1.0)</span>
                          </div>
                          <div className="text-sm font-medium text-slate-400 italic border-t border-slate-800 pt-2 mt-2">
                            *Decays over time (half-life: 30 days)
                          </div>
                        </div>
                        <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/50">
                          <div className="font-mono text-sm text-primary mb-1">C</div>
                          <div className="text-sm font-medium">Outbound Links</div>
                          <div className="text-xs text-muted-foreground">Normalizes vote weight</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 h-full flex flex-col space-y-6 overflow-hidden">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-slate-950/50 border-slate-800">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">Active Agents</div>
                  <div className="text-2xl font-bold">{leaderboard.length}</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-950/50 border-slate-800">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">Total Trust</div>
                  <div className="text-2xl font-bold text-primary">
                    {leaderboard.reduce((acc: number, curr: any) => acc + curr.score, 0).toFixed(1)}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex-1 overflow-hidden min-h-[400px]">
              <Leaderboard 
                agents={leaderboard} 
                selectedAgent={selectedAgent}
                onSelectAgent={setSelectedAgent}
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
