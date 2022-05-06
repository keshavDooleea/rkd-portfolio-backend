import mailer, { createTransport } from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { IMail, IMailResponse } from './email.interface';

@Injectable()
export class EmailService {
  private transporter: mailer.Transporter;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    this.transporter = createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  private sendMail(mail: IMail): Promise<IMailResponse> {
    return new Promise<IMailResponse>((resolve, reject) => {
      if (!this.transporter)
        return {
          status: 500,
          message: 'transporter not initialized correctly',
        };

      this.transporter.sendMail(mail, (error: Error | null, info: any) => {
        if (error) {
          console.log('sending email error', error.message);
          reject({ status: 500, message: error });
        } else {
          console.log(
            `Email by User ${mail.userId} sent to ${mail.to} successfully: ${info.response}`,
          );
          resolve({ status: 200, message: 'Email sent successfully' });
        }
      });
    });
  }

  async sendEmailToRKD(userId: string, message: string): Promise<void> {
    const mail: IMail = {
      from: 'rkdooleea@yahoo.com', // me sending
      to: `kdooleea@yahoo.ca`, // to my other email
      subject: `RKD - New Message by User ${userId}`,
      text: message, // body
      userId,
    };

    try {
      await this.sendMail(mail);
    } catch (error) {
      console.log(error);
    }
  }
}
