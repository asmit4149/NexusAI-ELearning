import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER || 'dummy_user',
    pass: process.env.SMTP_PASS || 'dummy_pass'
  }
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: '"NexusAI Platform" <noreply@nexusai.com>',
      to,
      subject,
      html,
    });
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw to prevent breaking the main flow if email fails
    return false;
  }
};

export const sendWelcomeEmail = async (email, name, courseTitle) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Welcome to ${courseTitle}, ${name}!</h2>
      <p>We are thrilled to have you on board. You are now officially enrolled.</p>
      <p>Log in to your dashboard to start learning immediately.</p>
      <br>
      <p>Happy Learning,<br>The NexusAI Team</p>
    </div>
  `;
  return sendEmail({ to: email, subject: `Welcome to ${courseTitle}!`, html });
};

export const sendPurchaseEmail = async (email, name, courseTitle, amount) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Purchase Confirmation</h2>
      <p>Hi ${name},</p>
      <p>Thank you for purchasing <strong>${courseTitle}</strong>.</p>
      <p>Amount Paid: $${amount}</p>
      <p>Your receipt is attached to your account.</p>
      <br>
      <p>Thanks,<br>The NexusAI Team</p>
    </div>
  `;
  return sendEmail({ to: email, subject: `Receipt for ${courseTitle}`, html });
};

export const sendCertificateEmail = async (email, name, courseTitle, certificateUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Congratulations ${name}! 🎉</h2>
      <p>You have successfully completed <strong>${courseTitle}</strong>.</p>
      <p>You can view and download your certificate here: <a href="${certificateUrl}">Download Certificate</a></p>
      <br>
      <p>Keep up the great work!<br>The NexusAI Team</p>
    </div>
  `;
  return sendEmail({ to: email, subject: `Your Certificate for ${courseTitle}`, html });
};
