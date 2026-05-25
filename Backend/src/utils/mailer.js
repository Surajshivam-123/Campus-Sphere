import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

/**
 * Send a 6-digit OTP to the given email address.
 */
export const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"Campus Sphere" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Campus Sphere Login OTP",
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#1e3a5f;margin-bottom:8px;">Campus Sphere</h2>
        <p style="color:#374151;font-size:14px;">Use the OTP below to sign in. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#1e3a5f;text-align:center;padding:16px 0;">
          ${otp}
        </div>
        <p style="color:#9ca3af;font-size:12px;text-align:center;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

/**
 * Send a welcome email after successful Google registration.
 */
export const sendWelcomeEmail = async (email, fullname) => {
  await transporter.sendMail({
    from: `"Campus Sphere" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to Campus Sphere!",
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#1e3a5f;margin-bottom:8px;">Welcome, ${fullname}!</h2>
        <p style="color:#374151;font-size:14px;">Your Campus Sphere account has been successfully created via Google.</p>
        <p style="color:#374151;font-size:14px;">You can now explore events, join teams, and stay connected with your campus.</p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">If you didn't create this account, please contact us immediately.</p>
      </div>
    `,
  });
};
