import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Calendar, Clock, X } from "lucide-react";

interface SchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  platform: string;
  onSchedule: (assetId: string, scheduledAt: Date) => Promise<void>;
}

export function SchedulerModal({
  isOpen,
  onClose,
  assetId,
  platform,
  onSchedule,
}: SchedulerModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [isLoading, setIsLoading] = useState(false);

  const handleSchedule = async () => {
    if (!date || !time) {
      toast.error("Please select date and time");
      return;
    }

    setIsLoading(true);
    try {
      const scheduledAt = new Date(`${date}T${time}`);
      if (scheduledAt < new Date()) {
        toast.error("Cannot schedule in the past");
        setIsLoading(false);
        return;
      }

      await onSchedule(assetId, scheduledAt);
      toast.success(`Scheduled for ${scheduledAt.toLocaleString()}`);
      onClose();
    } catch (err) {
      toast.error("Failed to schedule");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Schedule Post</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Clock className="h-4 w-4 inline mr-2" />
              Time
            </label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
            <p className="font-medium mb-1">Platform: {platform}</p>
            <p>Post will be published automatically at the scheduled time.</p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Scheduling..." : "Schedule"}
          </Button>
        </div>
      </div>
    </div>
  );
}
