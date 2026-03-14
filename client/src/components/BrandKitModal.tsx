import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X, Save, Upload } from "lucide-react";

interface BrandKitData {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  tone_of_voice: string;
  brand_keywords: string[];
  competitor_exclusions: string[];
  target_audience: string;
  presenter_profile?: {
    gender?: string;
    age?: string;
    ethnicity?: string;
    skin_tone?: string;
    voice_tone?: string;
    voice_accent?: string;
    style?: string;
    language?: string;
  };
}

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: BrandKitData;
  onSave: (data: BrandKitData) => Promise<void>;
}

export function BrandKitModal({ isOpen, onClose, initialData, onSave }: BrandKitModalProps) {
  const [data, setData] = useState<BrandKitData>(
    initialData || {
      primaryColor: "#0052FF",
      secondaryColor: "#00C853",
      fontFamily: "Inter",
      tone_of_voice: "",
      brand_keywords: [],
      competitor_exclusions: [],
      target_audience: "",
    }
  );

  const [newKeyword, setNewKeyword] = useState("");
  const [newCompetitor, setNewCompetitor] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(data);
      toast.success("Brand Kit saved!");
      onClose();
    } catch (err) {
      toast.error("Failed to save Brand Kit");
    } finally {
      setIsSaving(false);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      setData((prev) => ({
        ...prev,
        brand_keywords: [...(prev.brand_keywords || []), newKeyword],
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (index: number) => {
    setData((prev) => ({
      ...prev,
      brand_keywords: prev.brand_keywords?.filter((_, i) => i !== index),
    }));
  };

  const addCompetitor = () => {
    if (newCompetitor.trim()) {
      setData((prev) => ({
        ...prev,
        competitor_exclusions: [...(prev.competitor_exclusions || []), newCompetitor],
      }));
      setNewCompetitor("");
    }
  };

  const removeCompetitor = (index: number) => {
    setData((prev) => ({
      ...prev,
      competitor_exclusions: prev.competitor_exclusions?.filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Brand Kit</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Logo</label>
            <div className="flex gap-4 items-start">
              {data.logoUrl && (
                <img src={data.logoUrl} alt="Logo" className="h-16 w-16 object-contain" />
              )}
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter logo URL or upload"
                  value={data.logoUrl || ""}
                  onChange={(e) => setData((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  className="mb-2"
                />
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Primary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={data.primaryColor}
                  onChange={(e) => setData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                  className="h-10 w-20 rounded border border-slate-200 cursor-pointer"
                />
                <Input
                  type="text"
                  value={data.primaryColor}
                  onChange={(e) => setData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                  placeholder="#0052FF"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Secondary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={data.secondaryColor}
                  onChange={(e) => setData((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                  className="h-10 w-20 rounded border border-slate-200 cursor-pointer"
                />
                <Input
                  type="text"
                  value={data.secondaryColor}
                  onChange={(e) => setData((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                  placeholder="#00C853"
                />
              </div>
            </div>
          </div>

          {/* Font */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Font Family</label>
            <select
              value={data.fontFamily}
              onChange={(e) => setData((prev) => ({ ...prev, fontFamily: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
            >
              <option>Inter</option>
              <option>Sora</option>
              <option>Merriweather</option>
              <option>Playfair Display</option>
              <option>Poppins</option>
            </select>
          </div>

          {/* Tone of Voice */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tone of Voice</label>
            <Textarea
              value={data.tone_of_voice}
              onChange={(e) => setData((prev) => ({ ...prev, tone_of_voice: e.target.value }))}
              placeholder="Describe your brand voice (e.g., professional, friendly, casual, authoritative)"
              className="h-20"
            />
          </div>

          {/* Brand Keywords */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Brand Keywords</label>
            <div className="flex gap-2 mb-2">
              <Input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                placeholder="Add keyword and press Enter"
              />
              <Button onClick={addKeyword} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(data.brand_keywords || []).map((keyword, idx) => (
                <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                  {keyword}
                  <button onClick={() => removeKeyword(idx)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Competitor Exclusions */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Competitors to Exclude
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                type="text"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCompetitor()}
                placeholder="Add competitor name and press Enter"
              />
              <Button onClick={addCompetitor} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(data.competitor_exclusions || []).map((competitor, idx) => (
                <Badge key={idx} variant="outline" className="flex items-center gap-1">
                  {competitor}
                  <button onClick={() => removeCompetitor(idx)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience</label>
            <Textarea
              value={data.target_audience}
              onChange={(e) => setData((prev) => ({ ...prev, target_audience: e.target.value }))}
              placeholder="Describe your ideal customer (e.g., entrepreneurs aged 25-45, tech-savvy, interested in automation)"
              className="h-20"
            />
          </div>

          {/* Presenter Profile */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-4">Video Presenter Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={data.presenter_profile?.gender || ""}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    presenter_profile: {
                      ...prev.presenter_profile,
                      gender: e.target.value,
                    },
                  }))
                }
                className="px-3 py-2 border border-slate-200 rounded text-sm"
              >
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
              </select>

              <select
                value={data.presenter_profile?.age || ""}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    presenter_profile: {
                      ...prev.presenter_profile,
                      age: e.target.value,
                    },
                  }))
                }
                className="px-3 py-2 border border-slate-200 rounded text-sm"
              >
                <option value="">Age Range</option>
                <option value="18-25">18-25</option>
                <option value="25-35">25-35</option>
                <option value="35-45">35-45</option>
                <option value="45-55">45-55</option>
                <option value="55+">55+</option>
              </select>

              <select
                value={data.presenter_profile?.ethnicity || ""}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    presenter_profile: {
                      ...prev.presenter_profile,
                      ethnicity: e.target.value,
                    },
                  }))
                }
                className="px-3 py-2 border border-slate-200 rounded text-sm"
              >
                <option value="">Ethnicity</option>
                <option value="european">European</option>
                <option value="african">African</option>
                <option value="asian">Asian</option>
                <option value="hispanic">Hispanic</option>
                <option value="middle-eastern">Middle Eastern</option>
              </select>

              <select
                value={data.presenter_profile?.voice_tone || ""}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    presenter_profile: {
                      ...prev.presenter_profile,
                      voice_tone: e.target.value,
                    },
                  }))
                }
                className="px-3 py-2 border border-slate-200 rounded text-sm"
              >
                <option value="">Voice Tone</option>
                <option value="energetic">Energetic</option>
                <option value="calm">Calm</option>
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-2 justify-end">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
            {isSaving ? "Saving..." : <> <Save className="h-4 w-4 mr-2" /> Save Brand Kit </>}
          </Button>
        </div>
      </div>
    </div>
  );
}
