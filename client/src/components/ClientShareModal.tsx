import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Link, X, Globe } from "lucide-react";

interface ClientShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  onGenerateLink: (projectId: string) => Promise<string>;
}

export function ClientShareModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  onGenerateLink,
}: ClientShareModalProps) {
  const [shareLink, setShareLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateLink = async () => {
    setIsLoading(true);
    try {
      const link = await onGenerateLink(projectId);
      setShareLink(link);
      toast.success("Share link generated!");
    } catch (err) {
      toast.error("Failed to generate link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied to clipboard");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Share Campaign</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">Campaign</p>
            <p className="font-semibold text-slate-900">{projectName}</p>
          </div>

          {shareLink ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Globe className="h-4 w-4 inline mr-2" />
                Share Link
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="text-sm"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Share this link with your client. They can view and comment without logging in.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-sm text-blue-900 mb-4">
                Generate a public view-only link for your client to review this campaign.
              </p>
              <Button
                onClick={handleGenerateLink}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Generating..." : "Generate Share Link"}
              </Button>
            </div>
          )}
        </div>

        {shareLink && (
          <div className="space-y-2 pt-4 border-t">
            <h3 className="text-sm font-semibold text-slate-900">Permissions</h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p>✓ View all assets and content</p>
              <p>✓ Leave comments on assets</p>
              <p>✓ Download individual assets</p>
              <p>✗ Edit or delete assets</p>
              <p>✗ Publish to platforms</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end mt-6">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
