import React from 'react';
import { Trophy, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BLOCK_EXPLORER = 'https://sepolia.basescan.org';

interface AgentData {
  address: string;
  score: number;
  name?: string;
  description?: string;
  capabilities?: string[];
  tags?: string[];
  category?: string;
  ens_name?: string;
}

const Leaderboard = ({
  agents,
  selectedAgent,
  onSelectAgent
}: {
  agents: AgentData[],
  selectedAgent: string | null,
  onSelectAgent: (id: string | null) => void
}) => {
  const getAgentMetadata = (agent: AgentData) => {
    return {
      name: agent.name || `Agent ${agent.address.slice(2, 6)}`,
      desc: agent.description || "Autonomous agent service",
      ensName: agent.ens_name || null,
    };
  };

  return (
    <Card className="h-full border-slate-800 bg-slate-950/50 flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Agents
          </CardTitle>
          <Badge variant="outline" className="border-slate-700">Live Ranking</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-3">
          {agents.map((agent, i) => {
            const meta = getAgentMetadata(agent);
            const isSelected = selectedAgent === agent.address;

            return (
              <div
                key={agent.address}
                onClick={() => onSelectAgent(isSelected ? null : agent.address)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 group
                  ${isSelected
                    ? 'bg-slate-800 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-transform duration-200 ${isSelected ? 'scale-110' : ''}
                    ${i === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                      i === 1 ? 'bg-slate-400/20 text-slate-400 border border-slate-400/30' :
                      i === 2 ? 'bg-orange-700/20 text-orange-700 border border-orange-700/30' :
                      'bg-slate-800 text-slate-500'
                    }`}>
                    {i + 1}
                  </div>
                  <div>
                    <div className={`font-medium text-sm flex items-center gap-2 ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {meta.name}
                      {meta.ensName && (
                        <span className="text-[10px] font-normal text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">
                          {meta.ensName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`${BLOCK_EXPLORER}/address/${agent.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`text-[10px] font-mono font-normal hover:text-blue-400 transition-colors flex items-center gap-0.5 ${isSelected ? 'text-emerald-500/70' : 'text-slate-500'}`}
                      >
                        {agent.address.slice(0, 6)}...{agent.address.slice(-4)}
                        <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </div>
                    <div className="text-xs text-slate-500 truncate max-w-[180px]">
                      {meta.desc}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold font-mono text-sm ${isSelected ? 'text-emerald-400' : 'text-emerald-400/80'}`}>
                    {(agent.score * 100).toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-600 uppercase tracking-wider">Trust</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
