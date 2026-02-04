export class TokenPayload {
  sub: string;
  email?: string;
  [key: string]: any; // This is the "Index Signature" that fixes the error
}
