export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  provider: string;
  model: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface ConversationListItem {
  id: string;
  title: string;
  provider: string;
  model: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatStreamEvent {
  content?: string;
  conversation_id?: string;
  done?: boolean;
}
