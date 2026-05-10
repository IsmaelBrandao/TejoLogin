const nodemailer = require("nodemailer");

function getAppUrl() {
  return (process.env.APP_URL || "http://localhost:8081").replace(/\/$/, "");
}

function getFromAddress() {
  return process.env.MAIL_FROM || "TejoLogin <no-reply@localhost>";
}

function parseFromAddress(value) {
  const match = value.match(/^(.*)<(.+)>$/);

  if (!match) {
    return {
      email: value,
      name: "TejoLogin",
    };
  }

  return {
    email: match[2].trim(),
    name: match[1].replace(/"/g, "").trim() || "TejoLogin",
  };
}

function buildTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

function buildButtonHtml(label, url) {
  return `
    <a href="${url}" style="
      background:#0F5E53;
      border-radius:14px;
      color:#ffffff;
      display:inline-block;
      font-family:Arial,sans-serif;
      font-size:16px;
      font-weight:700;
      padding:14px 22px;
      text-decoration:none;
    ">${label}</a>
  `;
}

function emailShell(title, intro, actionLabel, actionUrl, note) {
  return `
    <div style="background:#F6F3EE;padding:32px 16px;">
      <div style="
        background:#ffffff;
        border:1px solid #E5DED2;
        border-radius:22px;
        margin:0 auto;
        max-width:560px;
        padding:32px;
      ">
        <p style="
          color:#B95D42;
          font-family:Arial,sans-serif;
          font-size:12px;
          font-weight:800;
          letter-spacing:.04em;
          margin:0 0 12px;
          text-transform:uppercase;
        ">TejoLogin</p>
        <h1 style="
          color:#17211D;
          font-family:Arial,sans-serif;
          font-size:28px;
          line-height:34px;
          margin:0 0 14px;
        ">${title}</h1>
        <p style="
          color:#5B625C;
          font-family:Arial,sans-serif;
          font-size:16px;
          line-height:24px;
          margin:0 0 24px;
        ">${intro}</p>
        ${buildButtonHtml(actionLabel, actionUrl)}
        <p style="
          color:#817A70;
          font-family:Arial,sans-serif;
          font-size:13px;
          line-height:20px;
          margin:24px 0 0;
        ">${note}</p>
        <p style="
          color:#817A70;
          font-family:Arial,sans-serif;
          font-size:12px;
          line-height:18px;
          margin:18px 0 0;
          word-break:break-all;
        ">${actionUrl}</p>
      </div>
    </div>
  `;
}

async function sendEmail({ to, subject, html, text }) {
  if (process.env.BREVO_API_KEY) {
    const sender = parseFromAddress(getFromAddress());
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      throw new Error(`Falha ao enviar e-mail pela Brevo API. ${details}`);
    }

    return response.json().catch(() => ({ provider: "brevo" }));
  }

  const transporter = buildTransporter();

  if (!transporter) {
    console.log("[email:dev]", { to, subject, text });
    return { preview: "logged" };
  }

  return transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    html,
    text,
  });
}

async function sendVerificationEmail({ email, name, token }) {
  const url = `${getAppUrl()}/verify-email?token=${token}`;

  return sendEmail({
    to: email,
    subject: "Confirme sua conta no TejoLogin",
    html: emailShell(
      "Confirme seu e-mail",
      `Ola, ${name}. Use o botao abaixo para confirmar sua conta e liberar o acesso.`,
      "Confirmar minha conta",
      url,
      "Este link expira em 24 horas. Se voce nao criou essa conta, ignore este e-mail."
    ),
    text: `Confirme sua conta no TejoLogin: ${url}`,
  });
}

async function sendPasswordResetEmail({ email, name, token }) {
  const url = `${getAppUrl()}/reset-password?token=${token}`;

  return sendEmail({
    to: email,
    subject: "Redefina sua senha no TejoLogin",
    html: emailShell(
      "Redefina sua senha",
      `Ola, ${name}. Recebemos uma solicitacao para redefinir sua senha.`,
      "Criar nova senha",
      url,
      "Este link expira em 1 hora. Se voce nao solicitou essa alteracao, ignore este e-mail."
    ),
    text: `Redefina sua senha no TejoLogin: ${url}`,
  });
}

module.exports = {
  sendPasswordResetEmail,
  sendVerificationEmail,
};
