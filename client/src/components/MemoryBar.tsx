import { Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MemoryBarProps {
  memory: {
    businessContext?: unknown;
    preferences?: unknown;
    recentTopics?: unknown;
    persistentFacts?: unknown;
  } | null;
}

export default function MemoryBar({ memory }: MemoryBarProps) {
  if (!memory) return null;

  const ctx = memory.businessContext as Record<string, string> | null;
  const brand = ctx?.brandName ?? ctx?.companyName ?? null;

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
      <Brain className="w-3.5 h-3.5 text-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        {brand ? (
          <p className="text-xs text-muted-foreground truncate">
            <span className="text-primary font-medium">{brand}</span>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">No brand context yet</p>
        )}
      </div>
      <Badge variant="outline" className="text-xs border-primary/20 text-primary py-0 px-1.5">
        AI
      </Badge>
    </div>
  );
}
