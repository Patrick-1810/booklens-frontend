export interface User {
  id: number;
  nome: string;
  email: string;
  criado_em?: string | null;
}

export interface AuthResponse {
  sucesso: boolean;
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  usuario: User;
}

export interface RefreshTokenResponse {
  sucesso: boolean;
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserMeResponse {
  sucesso: boolean;
  usuario: User;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegisterCredentials {
  nome: string;
  email: string;
  senha: string;
}
