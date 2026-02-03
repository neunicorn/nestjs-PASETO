export class TokenPayload {
  userId: string;
  email?: string;
  [key: string]: any; // This is the "Index Signature" that fixes the error
}
