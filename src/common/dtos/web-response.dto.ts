export class WebResponse<T> {
  code: number;
  status: boolean;
  data?: T;
  message: string;
}
