import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: "4fed805b878c91",
      pass: "5baf0b1e66b554",
    },
  });
  
export async function sendEmail(to:string,body:string){
  await transporter.sendMail({
        from: 'test@gmail.com', // sender address
        to: to, // list of receivers
        subject: "Bounty Update ✔", // Subject line
        text: body
      });
}
