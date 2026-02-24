const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTP = async (email, otp, name) => {
  const mailOptions = {
    from: `"FitAI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'FitAI - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="background: linear-gradient(135deg, #00ff88, #00bfff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; margin: 0;">FitAI</h1>
        </div>
        <h2 style="color: #fff; margin-bottom: 10px;">Welcome, ${name}!</h2>
        <p style="color: #aaa; margin-bottom: 30px;">Use the OTP below to verify your email address:</p>
        <div style="background: linear-gradient(135deg, #00ff88, #00bfff); padding: 3px; border-radius: 12px; margin-bottom: 30px;">
          <div style="background: #111; border-radius: 10px; padding: 20px; text-align: center;">
            <span style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #00ff88;">${otp}</span>
          </div>
        </div>
        <p style="color: #aaa; font-size: 14px;">This OTP expires in 10 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTP };
