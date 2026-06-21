import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = +(process.env.SMTP_PORT || 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.MAIL_FROM || 'Skyline <no-reply@skyline.com>';
const adminTo = process.env.ADMIN_EMAIL || 'admin@skyline.com';

// Real email is sent only when SMTP is configured; otherwise we log (demo-safe).
export const mailEnabled = Boolean(host && user && pass);
const transporter = mailEnabled
  ? nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
  : null;

function shell(title, body) {
  return `<div style="font-family:Arial,sans-serif;background:#0a1322;padding:28px;border-radius:14px;color:#eaf1fb;max-width:560px">
    <div style="font-size:22px;letter-spacing:3px;color:#e3c275;font-weight:bold">SKYLINE</div>
    <div style="font-size:11px;letter-spacing:2px;color:#c9a14a;margin-bottom:18px">GLOBAL MIGRATION &amp; VISA EXPERTS</div>
    <h2 style="color:#fff;margin:0 0 12px">${title}</h2>
    <div style="color:#c7d2e0;line-height:1.7">${body}</div>
    <hr style="border:none;border-top:1px solid rgba(255,255,255,.12);margin:20px 0"/>
    <div style="color:#8595a8;font-size:12px">© ${new Date().getFullYear()} Skyline Global Migration &amp; Visa Experts</div>
  </div>`;
}

async function send(to, subject, html) {
  if (!mailEnabled) { console.log(`[mail:skipped] "${subject}" → ${to}`); return; }
  try { await transporter.sendMail({ from, to, subject, html }); }
  catch (e) { console.error('[mail:error]', e.message); }
}

// Fire-and-forget notifications (never block the request).
export function notifyNewApplication(app, reference) {
  const kind = app.service_type || (app.job_id ? 'طلب وظيفة' : 'طلب');
  // Applicant confirmation
  send(app.email, `Skyline — تم استلام طلبك (${reference})`,
    shell('تم استلام طلبك بنجاح', `
      مرحباً ${app.full_name}،<br/><br/>
      شكراً لتواصلك مع سكايلاين. استلمنا طلبك من نوع <b>${kind}</b> برقم مرجعي <b>${reference}</b>،
      وسيقوم أحد مستشارينا بمراجعته والتواصل معك خلال 24 ساعة.<br/><br/>
      يمكنك متابعة حالة طلبك في أي وقت من حسابك على المنصة.`));
  // Admin alert
  send(adminTo, `طلب جديد: ${reference} — ${app.full_name}`,
    shell('طلب جديد على المنصة', `
      <b>المرجع:</b> ${reference}<br/>
      <b>الاسم:</b> ${app.full_name}<br/>
      <b>البريد:</b> ${app.email}<br/>
      <b>الهاتف:</b> ${app.phone || '—'}<br/>
      <b>النوع:</b> ${kind}<br/>
      <b>الوجهة:</b> ${app.target || '—'}`));
}

export function notifyContact(msg) {
  send(adminTo, `رسالة تواصل جديدة — ${msg.name}`,
    shell('رسالة جديدة من نموذج التواصل', `
      <b>الاسم:</b> ${msg.name}<br/>
      <b>البريد:</b> ${msg.email}<br/>
      <b>الموضوع:</b> ${msg.subject || '—'}<br/><br/>
      ${msg.body}`));
}
