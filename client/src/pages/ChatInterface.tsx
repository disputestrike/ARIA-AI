import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Send, Settings, LogOut, Menu, X, Sparkles, History, Plus,
  ChevronDown, FileText, Zap, Globe, BookOpen
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  entryPoint?: "full_campaign" | "existing_brand" | "specific_task" | null;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  messages: Message[];
}

export default function ARIAChat() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current conversation
  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Create new conversation
  const createNewConversation = () => {
    const newConvo: Conversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      createdAt: new Date(),
      messages: [],
    };
    setConversations([newConvo, ...conversations]);
    setCurrentConversationId(newConvo.id);
  };

  // Detect entry point from user message
  const detectEntryPoint = (message: string): "full_campaign" | "existing_brand" | "specific_task" => {
    const lowerMsg = message.toLowerCase();
    
    // Entry Point 2: Existing Brand (mentions website, URL, upload, existing brand)
    if (
      lowerMsg.includes("website") ||
      lowerMsg.includes("url") ||
      lowerMsg.includes("http") ||
      lowerMsg.includes("domain") ||
      lowerMsg.includes("upload") ||
      lowerMsg.includes("existing") ||
      lowerMsg.includes("my brand") ||
      lowerMsg.includes("my site") ||
      lowerMsg.includes(".com")
    ) {
      return "existing_brand";
    }

    // Entry Point 3: Specific Task (needs one thing: email, landing page, script, etc)
    if (
      lowerMsg.includes("just write") ||
      lowerMsg.includes("just create") ||
      lowerMsg.includes("one email") ||
      lowerMsg.includes("landing page") ||
      lowerMsg.includes("tiktok script") ||
      lowerMsg.includes("script") ||
      lowerMsg.includes("copy for") ||
      lowerMsg.includes("ad copy") ||
      lowerMsg.includes("subject line") ||
      lowerMsg.includes("social post")
    ) {
      return "specific_task";
    }

    // Default: Entry Point 1 - Full Campaign Builder
    return "full_campaign";
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentConversationId) return;

    const userMessage = inputValue;
    setInputValue("");
    setIsLoading(true);

    const entryPoint = detectEntryPoint(userMessage);

    // Add user message to conversation
    setConversations(prevConvos =>
      prevConvos.map(c => {
        if (c.id === currentConversationId) {
          return {
            ...c,
            messages: [
              ...c.messages,
              {
                id: Date.now().toString(),
                role: "user",
                content: userMessage,
                timestamp: new Date(),
                entryPoint,
              }
            ],
            title: c.messages.length === 0 ? userMessage.slice(0, 50) : c.title,
          };
        }
        return c;
      })
    );

    // TODO: Call tRPC to get ARIA response based on entry point
    // For now, show what entry point was detected
    const entryPointLabel = {
      full_campaign: "Full Campaign Builder",
      existing_brand: "Existing Brand Mode",
      specific_task: "Quick Task Mode",
    }[entryPoint];

    const assistantResponse = `Detected: **${entryPointLabel}**\n\nI'm setting up for: ${entryPointLabel}\n\nThis is where ARIA would ${
      entryPoint === "full_campaign" ? "search your website, analyze your industry, and show you a dynamic checklist." :
      entryPoint === "existing_brand" ? "load your Brand Kit and show only what's missing." :
      "build exactly what you asked for immediately, no questions."
    }`;

    // Simulate delay
    setTimeout(() => {
      setConversations(prevConvos =>
        prevConvos.map(c => {
          if (c.id === currentConversationId) {
            return {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: (Date.now() + 1).toString(),
                  role: "assistant",
                  content: assistantResponse,
                  timestamp: new Date(),
                }
              ]
            };
          }
          return c;
        })
      );
      setIsLoading(false);
    }, 500);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen w-screen flex bg-slate-900">
      {/* SIDEBAR */}
      <div className={`${sidebarOpen ? "w-64" : "w-0"} bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-200 overflow-hidden`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold">ARIA</span>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={createNewConversation}
          className="m-4 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 font-medium flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {conversations.map(convo => (
            <button
              key={convo.id}
              onClick={() => setCurrentConversationId(convo.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                currentConversationId === convo.id
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{convo.title}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 px-4 py-4">
          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-full flex items-center gap-3 hover:bg-slate-800 px-2 py-2 rounded-lg transition"
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>

            {/* Profile Popover Menu */}
            {showProfileMenu && (
              <div className="absolute bottom-full left-0 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg mb-2 z-50">
                <button
                  onClick={() => {
                    navigate("/settings");
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-2 transition border-b border-slate-700"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700 flex items-center gap-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col bg-slate-900">
        {/* Top Bar */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-slate-300" />
              ) : (
                <Menu className="w-5 h-5 text-slate-300" />
              )}
            </button>
            <div>
              <h1 className="text-white font-semibold">
                {currentConversation?.title || "Start a Conversation"}
              </h1>
              <p className="text-xs text-slate-400">
                {messages.length > 0
                  ? `${messages.length} message${messages.length !== 1 ? "s" : ""}`
                  : "No messages yet"}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">What do you want to build?</h2>
              <p className="text-slate-400 max-w-md mb-8">
                Tell me about your campaign, product, or the specific task you need done. I'll detect what you need and route you to the right mode.
              </p>
              
              {/* Quick Start Examples */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                <button
                  onClick={() => setInputValue("Launch my coffee subscription")}
                  className="bg-slate-800 hover:bg-slate-700 text-left px-4 py-3 rounded-lg transition border border-slate-700 flex items-start gap-3"
                >
                  <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm">Full Campaign</p>
                    <p className="text-slate-400 text-xs">I'll build everything</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setInputValue("Optimize my website: example.com")}
                  className="bg-slate-800 hover:bg-slate-700 text-left px-4 py-3 rounded-lg transition border border-slate-700 flex items-start gap-3"
                >
                  <Globe className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm">Existing Brand</p>
                    <p className="text-slate-400 text-xs">Upload or paste URL</p>
                  </div>
                </button>

                <button
                  onClick={() => setInputValue("Write me a TikTok script")}
                  className="bg-slate-800 hover:bg-slate-700 text-left px-4 py-3 rounded-lg transition border border-slate-700 flex items-start gap-3"
                >
                  <FileText className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm">Quick Task</p>
                    <p className="text-slate-400 text-xs">Just one thing, fast</p>
                  </div>
                </button>

                <button
                  onClick={() => setInputValue("What should I focus on first?")}
                  className="bg-slate-800 hover:bg-slate-700 text-left px-4 py-3 rounded-lg transition border border-slate-700 flex items-start gap-3"
                >
                  <BookOpen className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm">No Brand Yet</p>
                    <p className="text-slate-400 text-xs">Chat and explore</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-md lg:max-w-xl px-4 py-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-100"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {msg.entryPoint && (
                    <p className="text-xs mt-2 opacity-70">
                      Entry Point: {msg.entryPoint.replace(/_/g, " ")}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-100 px-4 py-3 rounded-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-slate-800 border-t border-slate-700 px-6 py-4">
          {currentConversationId && (
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Tell me what you need..."
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
