export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
