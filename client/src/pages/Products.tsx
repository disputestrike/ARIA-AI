import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Cpu, Sparkles, DollarSign } from "lucide-react";
import { useLocation } from "wouter";

export default function Products() {
  const [, navigate] = useLocation();
  const { data: products, isLoading } = trpc.products.list.useQuery();

  return (
    <ARIALayout title="Products" actions={
      <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Add+a+new+product+to+my+catalog")}>
        <Sparkles className="w-3.5 h-3.5" /> Add Product
      </Button>
    }>
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : products && products.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <Card key={p.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                  {p.targetAudience && (
                    <p className="text-xs text-primary mt-2">{p.targetAudience}</p>
                  )}
                  <Button size="sm" variant="outline" className="mt-3 w-full gap-1 h-7" onClick={() => navigate(`/?q=Create+marketing+campaign+for+product+${p.id}`)}>
                    <Sparkles className="w-3 h-3" /> Market This
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="p-12 text-center">
              <Cpu className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No products yet</h3>
              <p className="text-sm text-muted-foreground mb-6">Add your products so ARIA can create targeted campaigns</p>
              <Button className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Add+my+products+to+the+catalog")}>
                <Sparkles className="w-4 h-4" /> Add Products
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ARIALayout>
  );
}
