import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function LandingPagePublic() {
  const params = useParams<{ slug: string }>();
  const { data: page, isLoading } = trpc.landingPages.getBySlug.useQuery(
    { slug: params.slug ?? "" },
    { enabled: !!params.slug }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">This landing page doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // Render the HTML content of the landing page
  if (page.htmlContent) {
    return (
      <div
        className="min-h-screen"
        dangerouslySetInnerHTML={{ __html: page.htmlContent }}
      />
    );
  }

  // Fallback: render structured content
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <h1 className="text-4xl font-bold text-foreground">{page.headline ?? page.name}</h1>
        {page.subheadline && (
          <p className="text-xl text-muted-foreground">{page.subheadline}</p>
        )}
        {page.ctaText && (
          <Button size="lg" className="mt-8">
            {page.ctaText}
          </Button>
        )}
      </div>
    </div>
  );
}
