"use client";

import { useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { useUIStore } from "@/store/ui-store";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils/cn";
import {
  Plus, MessageSquare, Trash2, FileText, Settings, LogOut,
  Search, Edit3, Check, X, Download, Trash, MoreHorizontal,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import Avatar from "@/components/ui/avatar";
import { formatDate, truncate } from "@/lib/utils/format";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Sidebar() {
  const {
    conversations, currentConversationId, loadConversation,
    deleteConversation, renameConversation, clearAllConversations,
    exportConversation, newChat, searchQuery, setSearchQuery, loadConversations,
  } = useChat();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const pathname = usePathname();
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);

  const isActive = (path: string) => pathname === path;

  const handleNewChat = () => {
    newChat();
    router.push("/chat");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleRename = async (id: string) => {
    if (editTitle.trim()) {
      await renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleClearAll = async () => {
    await clearAllConversations();
    toast.success("All conversations cleared");
  };

  const handleExport = async (id: string) => {
    await exportConversation(id);
    setMenuId(null);
    toast.success("Conversation exported");
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    await loadConversations();
  };

  return (
    <>
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleSidebar} />
      )}

      <aside
        className={cn(
          "fixed md:relative z-50 h-full glass border-r border-border flex flex-col transition-all duration-300",
          sidebarOpen ? "w-72 left-0" : isMobile ? "-left-72 w-72" : "w-0 overflow-hidden",
        )}
      >
        <div className="flex flex-col h-full min-w-0 p-3">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                Z
              </div>
              <span className="font-semibold text-foreground text-sm">Zabi AI</span>
            </div>
          </div>

          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 w-full px-4 py-2.5 mb-3 rounded-xl bg-neon-500/10 border border-neon-500/30 text-neon-400 hover:bg-neon-500/20 transition-all duration-200 text-sm font-medium"
          >
            <Plus size={18} />
            New Chat
          </button>

          <form className="relative mb-3" onSubmit={(e) => e.preventDefault()} autoComplete="off">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoComplete="off"
              data-form-type="other"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface2/50 border border-border text-sm text-foreground placeholder:text-muted/40 outline-none focus:border-neon-500/30 transition-colors"
            />
          </form>

          <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare size={14} className="text-muted" />
              <span className="text-xs font-medium text-muted uppercase tracking-wider">Chats</span>
            </div>
            {conversations.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-muted hover:text-red-400 transition-colors"
                title="Clear all chats"
              >
                <Trash size={12} />
              </button>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto space-y-1 mb-4">
            {conversations.length === 0 && (
              <p className="text-xs text-muted/50 text-center py-4">No conversations yet</p>
            )}
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "sidebar-item group text-sm relative",
                  conv.id === currentConversationId && "active",
                )}
              >
                {editingId === conv.id ? (
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(conv.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="flex-1 bg-surface2 rounded-lg px-2 py-1 text-sm text-foreground outline-none border border-neon-500/30"
                      autoFocus
                    />
                    <button onClick={() => handleRename(conv.id)} className="text-green-400 hover:text-green-300">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-muted hover:text-foreground">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className="flex items-center gap-3 flex-1 min-w-0"
                      onClick={() => {
                        loadConversation(conv.id);
                        router.push("/chat");
                        if (isMobile) toggleSidebar();
                      }}
                    >
                      <MessageSquare size={16} className="shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{truncate(conv.title, 25)}</p>
                        <p className="text-xs text-muted/60">{formatDate(conv.updated_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(conv.id);
                          setEditTitle(conv.title);
                        }}
                        className="text-muted hover:text-neon-400 p-1"
                        title="Rename"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExport(conv.id);
                        }}
                        className="text-muted hover:text-neon-400 p-1"
                        title="Export"
                      >
                        <Download size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="text-muted hover:text-red-400 p-1"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </nav>

          <div className="border-t border-border pt-3 space-y-1">
            <button
              onClick={() => router.push("/documents")}
              className={cn("sidebar-item w-full text-sm", isActive("/documents") && "active")}
            >
              <FileText size={16} />
              Documents
            </button>
            <button
              onClick={() => router.push("/settings")}
              className={cn("sidebar-item w-full text-sm", isActive("/settings") && "active")}
            >
              <Settings size={16} />
              Settings
            </button>

            {user && (
              <div className="flex items-center gap-3 px-4 py-2.5 mt-2">
                <Avatar name={user.username} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{user.username}</p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
                <button onClick={handleLogout} className="text-muted hover:text-red-400 transition-colors" title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
