export interface IMailRequestBody {
  name: string;
  to: string;
  message: string;
}

export interface IMail {
  from: string;
  to: string;
  subject: string;
  text: string;
  userId: string;
}

export interface IMailResponse {
  status: number;
  message: string;
}
