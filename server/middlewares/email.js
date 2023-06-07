import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function sendVerificationCodeToEmail(mail, verificationCode) {
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            // Configure the email provider
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Define the email content
        const mailOptions = {
            from: process.env.EMAIL_ADDRESS,
            to: mail,
            subject: 'Password Reset Verification Code',
            text: `Your verification code is: ${verificationCode}`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        // console.log('Verification code sent to email:', mail);
    } catch (error) {
        console.error('Error sending verification code to email:', error);
    }
}

export default sendVerificationCodeToEmail;
