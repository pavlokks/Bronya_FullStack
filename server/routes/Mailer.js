require('dotenv').config();
const nodemailer = require('nodemailer');

// Функція для відправки email
const Mailer = async (to, sub, body) => {
  return new Promise((resolve, reject) => {
    const mailPass = process.env.EMAIL_PASS2; // Пароль для email
    const email = process.env.EMAIL; // Email-адреса відправника

    // Налаштування транспорту для Gmail
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: mailPass,
      },
    });

    // Налаштування параметрів листа
    const mailOptions = {
      from: email,
      to: to,
      subject: sub,
      html: `<html>
                <body>
                    <div style="margin: 0 auto; width: 600px; background: #f8f9fa; min-height: 250px; text-align: left; padding: 30px; border: 2px solid #d1d5db; border-radius: 8px;">
                        <div style="color: #1f2937; font-size: 24px; font-weight: bold; padding: 20px 0; font-family: 'Courier New', Courier, monospace;">${sub}</div>
                        <div style="color: #374151; font-size: 20px; padding: 20px 0; font-family: 'Courier New', Courier, monospace; line-height: 1.6;">${body}</div>
                    </div>
                </body>
            </html>`,
    };

    // Відправка листа
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error email sent:', error.stack);
        resolve(false);
      } else {
        console.log('Email sent:', info.response);
        resolve(true);
      }
    });
  });
};

module.exports = Mailer;
