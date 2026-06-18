export interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface DocumentSearchResult {
  id: string;
  text: string;
  metadata: Record<string, unknown>;
  distance: number;
}
