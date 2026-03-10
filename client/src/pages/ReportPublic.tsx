import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, BarChart3 } from "lucide-react";
import { Streamdown } from "streamdown";

export default function ReportPublic() {
  const params = useParams<{ token: string }>();
  const { data: report, isLoading } = trpc.reports.getByToken.useQuery(
    { token: params.token ?? "" },
    { enabled: !!params.token }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Report Not Found</h1>
          <p className="text-muted-foreground">This report link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const reportData = report.reportData as Record<string, unknown> | null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{report.name}</h1>
            <p className="text-sm text-muted-foreground">
              Generated {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {reportData?.summary != null && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-3">Executive Summary</h2>
            <div className="aria-prose">
              <Streamdown>{String(reportData.summary)}</Streamdown>
            </div>
          </div>
        )}

        {reportData?.metrics != null && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(reportData.metrics as Record<string, unknown>).map(([key, val]) => (
              <div key={key} className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{String(val)}</p>
              </div>
            ))}
          </div>
        )}

        {reportData?.content != null && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="aria-prose">
              <Streamdown>{String(reportData.content)}</Streamdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
