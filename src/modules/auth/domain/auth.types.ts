export interface AuthAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  managedVenueIds: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResult {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  account: AuthAccount;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

