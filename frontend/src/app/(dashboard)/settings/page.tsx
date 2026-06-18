"use client";

import { useEffect, useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { useAuthStore } from "@/store/auth-store";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { Settings, Bot, Palette, MessageSquareText, Zap, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AI_PROVIDERS } from "@/types/ai-provider";

interface ProviderStatus {
  id: string;
  name: string;
  has_key: boolean;
  models: string[];
}

export default function SettingsPage() {
  const { provider, model, setProvider, setModel, systemPrompt, setSystemPrompt } = useChat();
  const { user } = useAuthStore();
  const token = useAuthStore((s) => s.token);
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/settings/providers", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProviderStatuses(data))
      .catch(() => {});
  }, [token]);

  const selectedProvider = AI_PROVIDERS.find((p) => p.id === provider);
  const activeIds = new Set(providerStatuses.filter((s) => s.has_key).map((s) => s.id));
  const activeProviders = AI_PROVIDERS.filter((p) => activeIds.has(p.id));

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-neon-500/10 flex items-center justify-center">
            <Settings size={20} className="text-neon-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted">Configure your AI assistant</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* AI Provider Selection — only active providers */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Bot size={18} className="text-neon-400" />
              <h2 className="text-sm font-semibold text-foreground">AI Provider</h2>
              <Badge variant="info" className="ml-auto">
                {activeProviders.length} active
              </Badge>
            </div>
            {activeProviders.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">
                No providers active. Add an API key below to enable a provider.
              </p>
            ) : (
              <div className="grid gap-2">
                {activeProviders.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setProvider(p.id);
                      setModel(p.models[0]);
                    }}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-left",
                      provider === p.id
                        ? "border-neon-500/50 bg-neon-500/5 neon-border"
                        : "border-border bg-transparent hover:bg-surface2/50",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", p.color.replace("text-", "bg-"))} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted">{p.description}</p>
                      </div>
                    </div>
                    {provider === p.id && <Check size={16} className="text-neon-400" />}
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Model Selection */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Zap size={18} className="text-neon-400" />
              <h2 className="text-sm font-semibold text-foreground">
                Model
                {selectedProvider && <span className="text-muted font-normal ml-2">({selectedProvider.name})</span>}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedProvider?.models.map((m) => (
                <button
                  key={m}
                  onClick={() => setModel(m)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs transition-all duration-200",
                    model === m
                      ? "bg-neon-500/10 text-neon-400 border border-neon-500/30"
                      : "bg-surface2 text-muted border border-border hover:border-neon-500/20",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </Card>

          {/* System Prompt */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <MessageSquareText size={18} className="text-neon-400" />
              <h2 className="text-sm font-semibold text-foreground">System Prompt</h2>
            </div>
            <p className="text-xs text-muted mb-3">
              Set a custom system prompt to customize Zabi&apos;s behavior for all conversations.
            </p>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are Zabi, a helpful AI assistant. Be concise and accurate..."
              rows={4}
              className="w-full bg-surface2/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted/30 outline-none focus:border-neon-500/30 transition-colors resize-none"
            />
          </Card>

          {/* Profile */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Palette size={18} className="text-neon-400" />
              <h2 className="text-sm font-semibold text-foreground">Profile</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Username</span>
                <span className="text-sm text-foreground font-medium">{user?.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Email</span>
                <span className="text-sm text-foreground font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Active Provider</span>
                <Badge variant="info">{selectedProvider?.name}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Active Model</span>
                <span className="text-sm text-neon-400 font-mono">{model}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
