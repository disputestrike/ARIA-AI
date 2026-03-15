import React, { useState } from 'react';
import { ChevronRight, Plus, Settings, LogOut, Zap } from 'lucide-react';

type EntryPoint = null | 'full_campaign' | 'existing_brand' | 'specific_task';
type Step = 'entry_selection' | 'brief_input' | 'website_analysis' | 'checklist' | 'folder';

export function AriaMainInterface() {
  const [entryPoint, setEntryPoint] = useState<EntryPoint>(null);
  const [currentStep, setCurrentStep] = useState<Step>('entry_selection');
  const [projects, setProjects] = useState<any[]>([]);
  const [campaignName, setCampaignName] = useState('');
  const [brief, setBrief] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteAnalysis, setWebsiteAnalysis] = useState<any>(null);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Available assets for checklist
  const assetCategories = {
    'Content': ['Blog Post (800 words)', 'Email Sequence (5 emails)', 'Social Calendar (4 weeks)'],
    'Marketing': ['Landing Page', 'Google Ads', 'Facebook/Instagram Ads'],
    'Video': ['Video Script (60-90 sec)', 'TikTok Script', 'Testimonial Video'],
    'SEO': ['SEO Audit', 'Keyword Research', 'Meta Optimization'],
    'Advanced': ['Competitor Analysis', 'Market Report', 'Growth Strategy']
  };

  // ===== ENTRY POINT SELECTION =====
  if (currentStep === 'entry_selection' && !entryPoint) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">ARIA</h1>
            <p className="text-lg text-gray-600">Your AI Marketing Operating System</p>
          </div>

          {/* Entry Point Cards */}
          <div className="space-y-4">
            {/* Full Campaign */}
            <button
              onClick={() => {
                setEntryPoint('full_campaign');
                setCurrentStep('brief_input');
              }}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Full Campaign Builder</h3>
                  <p className="text-gray-600 mt-2">Describe your product/service and I'll build a complete marketing campaign with strategy, positioning, and all the assets you need.</p>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400" />
              </div>
            </button>

            {/* Existing Brand */}
            <button
              onClick={() => {
                setEntryPoint('existing_brand');
                setCurrentStep('website_analysis');
              }}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Optimize Existing Brand</h3>
                  <p className="text-gray-600 mt-2">Give me your website URL. I'll analyze what's working, find the gaps, and generate only the assets you're missing.</p>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400" />
              </div>
            </button>

            {/* Specific Task */}
            <button
              onClick={() => {
                setEntryPoint('specific_task');
                setCurrentStep('brief_input');
              }}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">One Quick Asset</h3>
                  <p className="text-gray-600 mt-2">Need just one thing? A blog post? A LinkedIn post? An email? Get it in 90 seconds.</p>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== FULL CAMPAIGN: BRIEF INPUT =====
  if (entryPoint === 'full_campaign' && currentStep === 'brief_input') {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => {
              setEntryPoint(null);
              setCurrentStep('entry_selection');
            }}
            className="text-gray-600 mb-8 hover:text-gray-900"
          >
            ← Back
          </button>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Full Campaign Builder</h2>
          <p className="text-gray-600 mb-8">Tell me about your business and what you want to achieve.</p>

          <div className="space-y-6">
            {/* Campaign Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Campaign Name</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Q1 Product Launch"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Brief */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Your Brief</label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="What do you sell? Who is your target audience? What's your unique angle? What's the goal?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentStep('checklist')}
              disabled={!campaignName || !brief}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              Choose Assets →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== EXISTING BRAND: WEBSITE ANALYSIS =====
  if (entryPoint === 'existing_brand' && currentStep === 'website_analysis') {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => {
              setEntryPoint(null);
              setCurrentStep('entry_selection');
            }}
            className="text-gray-600 mb-8 hover:text-gray-900"
          >
            ← Back
          </button>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Analyze Your Website</h2>
          <p className="text-gray-600 mb-8">Paste your website URL and I'll analyze what's working and what's missing.</p>

          {!websiteAnalysis ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Website URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={async () => {
                  setIsAnalyzing(true);
                  // Call backend analyzeWebsite
                  const response = await fetch('/api/aria/analyzeWebsite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: websiteUrl })
                  });
                  const result = await response.json();
                  setWebsiteAnalysis(result.data);
                  setCampaignName(`Optimize: ${new URL(websiteUrl).hostname}`);
                  setIsAnalyzing(false);
                }}
                disabled={!websiteUrl || isAnalyzing}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Website'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Analysis Results */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Website Analysis</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Domain Authority</p>
                    <p className="text-2xl font-bold text-gray-900">{websiteAnalysis?.domainScore || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Monthly Traffic</p>
                    <p className="text-2xl font-bold text-gray-900">{websiteAnalysis?.monthlyTraffic || 0}</p>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Strengths</h4>
                <ul className="space-y-1">
                  {websiteAnalysis?.strengths?.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-gray-700">✓ {s}</li>
                  ))}
                </ul>
              </div>

              {/* Gaps */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What's Missing</h4>
                <ul className="space-y-1">
                  {websiteAnalysis?.gaps?.map((g: string, i: number) => (
                    <li key={i} className="text-sm text-gray-700">✗ {g}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setCurrentStep('checklist')}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Generate Missing Assets →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== ASSET CHECKLIST (Multi-Select) =====
  if (currentStep === 'checklist') {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => {
              setCurrentStep(entryPoint === 'full_campaign' ? 'brief_input' : 'website_analysis');
            }}
            className="text-gray-600 mb-8 hover:text-gray-900"
          >
            ← Back
          </button>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Assets to Generate</h2>
          <p className="text-gray-600 mb-8">Check the boxes for everything you want. You can select multiple.</p>

          <div className="space-y-8">
            {Object.entries(assetCategories).map(([category, assets]) => (
              <div key={category}>
                <h3 className="font-semibold text-gray-900 mb-4">{category}</h3>
                <div className="space-y-3">
                  {assets.map((asset) => (
                    <label key={asset} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAssets.includes(asset)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAssets([...selectedAssets, asset]);
                          } else {
                            setSelectedAssets(selectedAssets.filter((a) => a !== asset));
                          }
                        }}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-700">{asset}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentStep('folder')}
            disabled={selectedAssets.length === 0}
            className="w-full mt-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            Generate Campaign ({selectedAssets.length} assets)
          </button>
        </div>
      </div>
    );
  }

  // ===== CAMPAIGN FOLDER =====
  if (currentStep === 'folder') {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex h-screen">
          {/* Left Sidebar - Project List */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-gray-900">Projects</h2>
              <button className="p-2 hover:bg-gray-200 rounded">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-blue-100 text-blue-900 rounded-lg font-medium">
                {campaignName}
              </div>
            </div>

            <hr className="my-6" />

            {/* User Info */}
            <div className="mt-auto space-y-4">
              <button className="w-full flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
              <button className="w-full flex items-center space-x-2 p-2 hover:bg-gray-200 rounded">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Main Content - Assets */}
          <div className="flex-1 p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{campaignName}</h1>
            <p className="text-gray-600 mb-8">{selectedAssets.length} assets ready to generate</p>

            {/* Asset Grid */}
            <div className="grid grid-cols-2 gap-6">
              {selectedAssets.map((asset, index) => (
                <div
                  key={index}
                  className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition"
                >
                  <h3 className="font-semibold text-gray-900 mb-4">{asset}</h3>

                  {/* 8-Control Bar */}
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                      ✎ Edit
                    </button>
                    <button className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                      ↻ Regen
                    </button>
                    <button className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                      ⧈ Copy
                    </button>
                    <button className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                      ⬇ Down
                    </button>
                    <button className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                      → Publish
                    </button>
                    <button className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                      ⏱ Schedule
                    </button>
                    <button className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                      ⊕ Share
                    </button>
                    <button className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
                      × Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default AriaMainInterface;
