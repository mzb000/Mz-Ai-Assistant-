export type AIProviderType =
  | "openai"
  | "anthropic"
  | "openrouter"
  | "deepseek"
  | "gemini"
  | "groq"
  | "mistral"
  | "cohere"
  | "together"
  | "xai"
  | "ollama";

export interface AIProviderOption {
  id: AIProviderType;
  name: string;
  description: string;
  color: string;
  models: string[];
}

export const AI_PROVIDERS: AIProviderOption[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4o, GPT-4 Turbo, o1",
    color: "text-green-400",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo", "o1", "o1-mini"],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude Sonnet 4, Opus 4, Haiku 4",
    color: "text-orange-400",
    models: [
      "claude-sonnet-4-20250514",
      "claude-opus-4-20250514",
      "claude-haiku-4-20250414",
      "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022",
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Gemini 2.5 Flash, 2.5 Pro, 2.0",
    color: "text-yellow-400",
    models: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro", "gemini-1.5-flash"],
  },
  {
    id: "groq",
    name: "Groq",
    description: "Ultra-fast LLama, Mixtral, Gemma",
    color: "text-pink-400",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it", "mixtral-8x7b-32768", "deepseek-r1-distill-llama-70b"],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "DeepSeek Chat & Reasoner",
    color: "text-cyan-400",
    models: ["deepseek-chat", "deepseek-reasoner"],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    description: "Mistral Large, Medium, Codestral",
    color: "text-indigo-400",
    models: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest", "open-mistral-nemo", "codestral-latest"],
  },
  {
    id: "xai",
    name: "xAI (Grok)",
    description: "Grok 3, Grok 3 Mini, Grok 2",
    color: "text-slate-300",
    models: ["grok-3", "grok-3-mini", "grok-2"],
  },
  {
    id: "cohere",
    name: "Cohere",
    description: "Command R+, Command R, Command A",
    color: "text-emerald-400",
    models: ["command-r-plus", "command-r", "command-a-03-2025"],
  },
  {
    id: "together",
    name: "Together AI",
    description: "Llama, Mixtral, Qwen, DeepSeek R1",
    color: "text-violet-400",
    models: [
      "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      "mistralai/Mixtral-8x7B-Instruct-v0.1",
      "Qwen/Qwen2.5-72B-Instruct-Turbo",
      "deepseek-ai/DeepSeek-R1",
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Access 100+ models via one key",
    color: "text-purple-400",
    models: ["openai/gpt-4o", "openai/gpt-4o-mini", "anthropic/claude-3.5-sonnet", "google/gemini-2.0-flash", "meta-llama/llama-3.3-70b-instruct"],
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    description: "Run models locally — no API key needed",
    color: "text-blue-400",
    models: ["llama3.2", "llama3.1", "mistral", "codellama", "phi3", "gemma2"],
  },
];
