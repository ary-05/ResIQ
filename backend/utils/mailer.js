const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
transporter.verify((error, success) => {
  if (error) console.log("Mailer error:", error);
  else console.log("Mailer ready");
});

const sendOTPEmail = async (email, name, otp) => {
  const mailOptions = {
    from: `"ResIQ" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your ResIQ verification code",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; background: #111111; padding: 40px; border-radius: 16px; border: 1px solid #8a7a5a;">
        <div style="margin-bottom: 32px;">
          <h1 style="font-size: 1.8rem; font-weight: 800; color: #c9a84c; margin: 0;">ResIQ</h1>
        </div>
        <h2 style="color: #e8d5a3; font-size: 1.2rem; margin-bottom: 8px;">Hi ${name}, verify your email</h2>
        <p style="color: #a89070; font-size: 0.9rem; margin-bottom: 32px;">
          Use the code below to complete your registration. It expires in 10 minutes.
        </p>
        <div style="background: #1c1c1c; border: 1px solid #8a7a5a; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
          <p style="font-size: 2.5rem; font-weight: 900; letter-spacing: 0.3em; color: #c9a84c; margin: 0;">${otp}</p>
        </div>
        <p style="color: #5a4a3a; font-size: 0.78rem;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log("Email sent:", result.messageId);
};

// ── Password reset OTP email ──────────────────────────────────────────────
const sendPasswordResetEmail = async (email, name, otp) => {
  const mailOptions = {
    from: `"ResIQ" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your ResIQ password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; background: #111111; padding: 40px; border-radius: 16px; border: 1px solid #8a7a5a;">
        <div style="margin-bottom: 32px;">
          <h1 style="font-size: 1.8rem; font-weight: 800; color: #c9a84c; margin: 0;">ResIQ</h1>
        </div>
        <h2 style="color: #e8d5a3; font-size: 1.2rem; margin-bottom: 8px;">Hi ${name}, reset your password</h2>
        <p style="color: #a89070; font-size: 0.9rem; margin-bottom: 32px;">
          Use the code below to reset your password. It expires in 10 minutes. If you didn't request this, you can ignore this email — your password won't change.
        </p>
        <div style="background: #1c1c1c; border: 1px solid #8a7a5a; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
          <p style="font-size: 2.5rem; font-weight: 900; letter-spacing: 0.3em; color: #c9a84c; margin: 0;">${otp}</p>
        </div>
        <p style="color: #5a4a3a; font-size: 0.78rem;">
          Never share this code with anyone, including ResIQ staff.
        </p>
      </div>
    `,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log("Reset email sent:", result.messageId);
};

module.exports = { sendOTPEmail, sendPasswordResetEmail };