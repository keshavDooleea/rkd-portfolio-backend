import mailer, { createTransport } from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { IMail, IMailResponse } from './email.interface';
import { Message } from 'src/users/schemas/message.schema';

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
            `Email by ${mail.destinationInfo} sent to ${mail.to} successfully: ${info.response}`,
          );
          resolve({ status: 200, message: 'Email sent successfully' });
        }
      });
    });
  }

  private getUserEmailTemplate(message: Message): string {
    return `<div>
    <small>Reetesh said at ${message.createdAt}:</small>
    </br>
    <p>${message.message}<p>
    </br>
    </br>
    <a href="https://www.rkdooleea.com/?showChat=true">
      Click here to view message at https://www.rkdooleea.com
    </a>
  </div>`;
  }

  async sendEmailToRKD(userId: string, message: string): Promise<void> {
    const mail: IMail = {
      from: 'rkdooleea@yahoo.com', // me sending
      to: `kdooleea@yahoo.ca`, // to my other email
      subject: `RKD - New Message by User ${userId}`,
      text: message, // body
      destinationInfo: `User ${userId}`,
    };

    try {
      await this.sendMail(mail);
    } catch (error) {
      console.log(error);
    }
  }

  async sendEmailToUser(userEmail: string, message: Message): Promise<void> {
    const mail: IMail = {
      from: 'rkdooleea@yahoo.com', // me sending
      to: `kdooleea@yahoo.ca, ${userEmail}`, // to my other email
      subject: 'New Message from Reetesh Dooleea [RKD Portfolio]',
      html: this.getUserEmailTemplate(message), // body
      destinationInfo: 'Myself',
    };

    try {
      await this.sendMail(mail);
    } catch (error) {
      console.log(error);
    }
  }
}
