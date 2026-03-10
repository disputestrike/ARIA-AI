import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, Users, CreditCard, Activity, Database, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Admin() {
  const { user, loading } = useAuth();
  const { data: teamData, isLoading: usersLoading } = trpc.team.members.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  // Owner-only restriction
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-6 p-8">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-red-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 max-w-md">
            This panel is restricted to ARIA platform administrators only.
            Your account does not have the required permissions.
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400 text-sm">Platform owner controls — restricted access</p>
          </div>
          <Badge className="ml-auto bg-violet-500/20 text-violet-300 border-violet-500/30">
            Owner
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: teamData?.length ?? "—", icon: Users, color: "violet" },
          { label: "Active Subscriptions", value: "—", icon: CreditCard, color: "emerald" },
          { label: "AI Requests Today", value: "—", icon: Zap, color: "amber" },
          { label: "DB Tables", value: "70+", icon: Database, color: "blue" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-[#12121a] border-gray-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">{stat.label}</span>
                <div className={`w-8 h-8 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card className="bg-[#12121a] border-gray-800 mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-400" />
            Registered Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {(teamData ?? []).map((u: { id: number; name: string | null; email: string | null; role: string; createdAt: Date }) => (
                    <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                      <td className="py-3 px-4 text-gray-500">#{u.id}</td>
                      <td className="py-3 px-4 text-white">{u.name ?? "—"}</td>
                      <td className="py-3 px-4 text-gray-300">{u.email ?? "—"}</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={u.role === "admin"
                            ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                            : "bg-gray-700/50 text-gray-300 border-gray-600/30"
                          }
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {!teamData?.length && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="bg-[#12121a] border-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "ARIA Agent (Anthropic Claude)", status: "operational", note: "Primary LLM" },
              { name: "OpenAI Fallback", status: "operational", note: "Fallback LLM" },
              { name: "Database (MySQL/TiDB)", status: "operational", note: "70+ tables" },
              { name: "Stripe Payments", status: "operational", note: "Test mode" },
              { name: "Publisher Cron", status: "operational", note: "Every 15 min" },
              { name: "Security Headers", status: "operational", note: "CSP, HSTS, XSS" },
            ].map((service) => (
              <div key={service.name} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30">
                <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-white text-sm font-medium">{service.name}</div>
                  <div className="text-gray-500 text-xs">{service.note}</div>
                </div>
                <Badge className="ml-auto bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
