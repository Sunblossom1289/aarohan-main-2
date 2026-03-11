// backend/services/emailService.js
const nodemailer = require('nodemailer');

// Configure transporter — credentials MUST come from environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('⚠️  EMAIL_USER or EMAIL_PASS not set — email sending will be disabled.');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email templates
const templates = {
  booked: (data) => ({
    subject: '✅ Your Career Mentorship Session is Confirmed!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Session Confirmed! 🎉</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-top: none;">
          <p style="font-size: 16px; color: #333;">Dear <strong>${data.name}</strong>,</p>
          <p style="color: #666;">Great news! Your career mentorship session has been accepted by a counselor.</p>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="margin: 0 0 15px 0; color: #333;">📅 Session Details</h3>
            <p style="margin: 5px 0; color: #555;"><strong>Counselor:</strong> ${data.counselorName}</p>
            <p style="margin: 5px 0; color: #555;"><strong>Date:</strong> ${new Date(data.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 5px 0; color: #555;"><strong>Time:</strong> ${data.time}</p>
            <p style="margin: 5px 0; color: #555;"><strong>Duration:</strong> 30 minutes</p>
          </div>
          
          ${data.meetLink ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.meetLink}" 
               style="background: #1a73e8; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              🔗 Join Meeting
            </a>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">Link: ${data.meetLink}</p>
          </div>
          ` : ''}
          
          <p style="color: #666; font-size: 14px;">Please be ready 5 minutes before the scheduled time.</p>
        </div>
        <div style="background: #333; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
          <p style="color: #aaa; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} Aarohan - Career Guidance Platform</p>
        </div>
      </div>
    `
  }),

  counselor_new_booking: (data) => ({
    subject: '📋 New Session Booked - Career Mentorship Scheduled',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Session Scheduled! 📋</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-top: none;">
          <p style="font-size: 16px; color: #333;">Dear <strong>${data.name}</strong>,</p>
          <p style="color: #666;">You have successfully accepted a career mentorship session.</p>
          
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #17a2b8;">
            <h3 style="margin: 0 0 15px 0; color: #333;">📅 Session Details</h3>
            <p style="margin: 5px 0; color: #555;"><strong>Student:</strong> ${data.studentName}</p>
            <p style="margin: 5px 0; color: #555;"><strong>Date:</strong> ${new Date(data.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 5px 0; color: #555;"><strong>Time:</strong> ${data.time}</p>
            <p style="margin: 5px 0; color: #555;"><strong>Duration:</strong> 30 minutes</p>
          </div>
          
          ${data.meetLink ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.meetLink}" 
               style="background: #1a73e8; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              🔗 Join Meeting
            </a>
          </div>
          ` : ''}
        </div>
        <div style="background: #333; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
          <p style="color: #aaa; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} Aarohan - Career Guidance Platform</p>
        </div>
      </div>
    `
  }),

  completed: (data) => ({
    subject: '✨ Session Completed - We Value Your Feedback!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Session Complete! ✨</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-top: none;">
          <p style="font-size: 16px; color: #333;">Dear <strong>${data.name}</strong>,</p>
          <p style="color: #666;">Your career mentorship session with <strong>${data.counselorName}</strong> has been marked as complete.</p>
          
          ${data.notes ? `
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #6f42c1;">
            <h3 style="margin: 0 0 15px 0; color: #333;">📝 Counselor's Notes</h3>
            <p style="color: #555; line-height: 1.6;">${data.notes}</p>
          </div>
          ` : ''}
          
          <div style="background: #e8f5e9; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <h3 style="margin: 0 0 15px 0; color: #2e7d32;">💬 We Appreciate Your Feedback!</h3>
            <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">Your feedback helps us improve our career mentorship services and provide better guidance to students like you.</p>
            <div style="text-align: center;">
              <a href="https://forms.gle/saqVcqEcyBneHQxV6" 
                 style="background: #4caf50; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                📝 Share Your Feedback
              </a>
            </div>
          </div>
          
          <p style="color: #666;">We hope this session was helpful! You can book another session anytime from your dashboard.</p>
        </div>
        <div style="background: #333; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
          <p style="color: #aaa; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} Aarohan - Career Guidance Platform</p>
        </div>
      </div>
    `
  })
};

// OTP Email template
const sendOtpEmail = async (to, otp, studentName) => {
  try {
    const mailOptions = {
      from: `"Aarohan" <${process.env.EMAIL_USER || 'noreply@aarohan.com'}>`,
      to,
      subject: '🔐 Email Verification OTP - Aarohan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1b4965 0%, #1FB8CD 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Verify Your Email</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-top: none;">
            <p style="font-size: 16px; color: #333;">Hi <strong>${studentName || 'Student'}</strong>,</p>
            <p style="color: #666;">Use the OTP below to verify your email address on Aarohan:</p>
            <div style="text-align: center; margin: 28px 0;">
              <div style="display: inline-block; background: #1b4965; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 18px 36px; border-radius: 12px;">
                ${otp}
              </div>
            </div>
            <p style="color: #999; font-size: 13px; text-align: center;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
          </div>
          <div style="background: #333; padding: 16px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="color: #aaa; margin: 0; font-size: 12px;">&copy; ${new Date().getFullYear()} Aarohan - Career Guidance Platform</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ OTP email send failed to ${to}:`, error.message);
    throw error;
  }
};

// Send email function
const sendSessionEmail = async (to, templateName, data) => {
  try {
    const template = templates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const { subject, html } = template(data);

    const mailOptions = {
      from: `"Aarohan Career Mentorship" <${process.env.EMAIL_USER || 'noreply@aarohan.com'}>`,
      to: to,
      subject: subject,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Email send failed to ${to}:`, error.message);
    throw error;
  }
};

// ─── Student Support Email ────────────────────────────────────────────────────
const SUPPORT_INBOX = 'hr.myaarohan@gmail.com';

// Escape HTML to prevent injection in email templates
const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const sendSupportEmail = async (data) => {
  const priorityColor = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' }[data.priority] || '#6b7280';
  const categoryIcons = {
    Technical:  '🛠️',
    Academic:   '📚',
    Counseling: '🧭',
    Payment:    '💳',
    Other:      '📋',
  };
  const icon = categoryIcons[data.category] || '📋';

  // Sanitise all user-provided fields
  const safe = {
    studentName:  escapeHtml(data.studentName),
    studentEmail: escapeHtml(data.studentEmail),
    studentPhone: escapeHtml(data.studentPhone),
    subject:      escapeHtml(data.subject),
    description:  escapeHtml(data.description),
    priority:     escapeHtml(data.priority),
    category:     escapeHtml(data.category),
    submittedAt:  escapeHtml(data.submittedAt),
  };

  const mailOptions = {
    from: `"Aarohan Student Support" <${process.env.EMAIL_USER || 'noreply@aarohan.com'}>`,
    to:      SUPPORT_INBOX,
    replyTo: data.studentEmail,
    subject: `[Support] ${icon} ${safe.category} — ${safe.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1b4965 0%, #1FB8CD 100%); padding: 28px 32px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">🎓 Student Support Request</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">Submitted via Aarohan Student Dashboard</p>
        </div>

        <!-- Body -->
        <div style="background: #f8fafc; padding: 28px 32px; border: 1px solid #e2e8f0; border-top: none;">

          <!-- Priority badge -->
          <div style="margin-bottom: 20px;">
            <span style="display: inline-block; background: ${priorityColor}; color: white; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px;">
              ${safe.priority} Priority
            </span>
            <span style="display: inline-block; background: #e2e8f0; color: #475569; font-size: 12px; font-weight: 600; padding: 4px 14px; border-radius: 999px; margin-left: 8px;">
              ${icon} ${safe.category}
            </span>
          </div>

          <!-- Student info -->
          <div style="background: white; border-radius: 10px; padding: 20px 24px; margin-bottom: 20px; border-left: 4px solid #1FB8CD; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
            <h3 style="margin: 0 0 14px; color: #1e293b; font-size: 15px;">👤 Student Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0; color: #64748b; width: 120px;"><strong>Name</strong></td><td style="padding: 5px 0; color: #334155;">${safe.studentName}</td></tr>
              <tr><td style="padding: 5px 0; color: #64748b;"><strong>Email</strong></td><td style="padding: 5px 0; color: #334155;"><a href="mailto:${safe.studentEmail}" style="color: #1b4965;">${safe.studentEmail}</a></td></tr>
              <tr><td style="padding: 5px 0; color: #64748b;"><strong>Phone</strong></td><td style="padding: 5px 0; color: #334155;">${safe.studentPhone}</td></tr>
              <tr><td style="padding: 5px 0; color: #64748b;"><strong>Submitted</strong></td><td style="padding: 5px 0; color: #334155;">${safe.submittedAt} IST</td></tr>
            </table>
          </div>

          <!-- Issue -->
          <div style="background: white; border-radius: 10px; padding: 20px 24px; border-left: 4px solid #7c3aed; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
            <h3 style="margin: 0 0 8px; color: #1e293b; font-size: 15px;">📝 Issue Details</h3>
            <p style="margin: 0 0 14px; font-size: 17px; font-weight: 600; color: #1e293b;">${safe.subject}</p>
            <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; color: #334155; line-height: 1.7; font-size: 14px; white-space: pre-wrap;">${safe.description}</div>
          </div>

          <p style="margin-top: 24px; font-size: 13px; color: #94a3b8; text-align: center;">
            Reply directly to this email to respond to the student at <strong>${safe.studentEmail}</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #1e293b; padding: 18px 32px; border-radius: 0 0 12px 12px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} Aarohan — Career Guidance Platform</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Support email sent → ${SUPPORT_INBOX}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('❌ Support email failed:', err.message);
    throw err;
  }
};

module.exports = { sendSessionEmail, sendOtpEmail, sendSupportEmail };
