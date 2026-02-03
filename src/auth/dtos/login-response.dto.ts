import { TokenResponse } from '../paseto/dtos/token-response.dto';

export class LoginResponse {
  id: string;
  token?: TokenResponse;
}
