import React from 'react';
import { Trophy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Agent {
  address: string;
  score: number;
}

const Leaderboard = ({ data }: { data: Agent[] }) => {
  return (
    <Card className="h-full border-slate-800 bg-slate-950/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Agents
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="flex flex-col">
          {data.map((agent, index) => (
            <div 
              key={agent.address} 
              className="flex items-center justify-between px-6 py-3 hover:bg-slate-900/50 transition-colors border-b border-slate-800/50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                  ${index < 3 ? 'bg-orange-500/20 text-orange-500' : 'bg-slate-800 text-slate-400'}
                `}>
                  {index + 1}
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-sm text-slate-200">
                    {agent.address.slice(0, 6)}...{agent.address.slice(-4)}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <Badge variant="outline" className="font-mono border-emerald-500/20 text-emerald-500 bg-emerald-500/10">
                  {(agent.score * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
