const path = require("path");
const nodemailer = require("nodemailer");

const logoPath = path.resolve(__dirname, "../../assets/images/tejopan-email-logo.png");
const logoCid = "tejopan-logo";

function getAppUrl() {
  return (process.env.APP_URL || "http://localhost:8081").replace(/\/$/, "");
}

function getLogoUrl() {
  return `${getAppUrl()}/email-assets/tejopan-email-logo.png`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getFromAddress() {
  return process.env.MAIL_FROM || "TEJOPAN <no-reply@localhost>";
}

function parseFromAddress(value) {
  const match = value.match(/^(.*)<(.+)>$/);

  if (!match) {
    return {
      email: value,
      name: "TEJOPAN",
    };
  }

  return {
    email: match[2].trim(),
    name: match[1].replace(/"/g, "").trim() || "TEJOPAN",
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
      background:#8A4A24;
      border:1px solid #B87938;
      border-radius:16px;
      box-shadow:0 14px 26px rgba(116,63,31,.24);
      color:#FFF7EA;
      display:inline-block;
      font-family:Arial,sans-serif;
      font-size:16px;
      font-weight:800;
      min-width:220px;
      padding:16px 24px;
      text-decoration:none;
      text-align:center;
    ">${label}</a>
  `;
}

function emailShell({
  title,
  eyebrow,
  intro,
  actionLabel,
  actionUrl,
  note,
  footer,
  logoSrc = `cid:${logoCid}`,
}) {
  return `
    <div style="
      background:#FFF8EE;
      padding:36px 16px;
    ">
      <div style="
        background:#FFFDF7;
        border:1px solid #E5CDA8;
        border-radius:28px;
        box-shadow:0 18px 44px rgba(74,36,20,.12);
        overflow:hidden;
        margin:0 auto;
        max-width:620px;
      ">
        <div style="
          background:linear-gradient(135deg,#4A2414,#7A3E1C);
          padding:28px 28px 22px;
          text-align:center;
        ">
          <img src="${logoSrc}" width="230" alt="TEJOPAN" style="
            display:block;
            margin:0 auto;
            max-width:230px;
            width:62%;
          " />
        </div>

        <div style="padding:34px 34px 30px;text-align:center;">
          <div style="display:inline-block;margin:0 auto 22px;">
            <span style="
              background:#F5E0BD;
              border-radius:999px;
              display:inline-block;
              height:7px;
              margin:0 7px;
              width:54px;
            "></span>
            <span style="
              background:#C35F2F;
              border-radius:999px;
              display:inline-block;
              height:8px;
              width:8px;
            "></span>
            <span style="
              background:#F5E0BD;
              border-radius:999px;
              display:inline-block;
              height:7px;
              margin:0 7px;
              width:54px;
            "></span>
          </div>

        <p style="
          color:#C35F2F;
          font-family:Arial,sans-serif;
          font-size:12px;
          font-weight:900;
          letter-spacing:.04em;
          margin:0 0 12px;
          text-transform:uppercase;
        ">${eyebrow}</p>
        <h1 style="
          color:#25160F;
          font-family:Arial,sans-serif;
          font-size:32px;
          line-height:38px;
          margin:0 0 14px;
        ">${title}</h1>
        <p style="
          color:#6B594B;
          font-family:Arial,sans-serif;
          font-size:16px;
          line-height:25px;
          margin:0 auto 28px;
          max-width:470px;
        ">${intro}</p>
        ${buildButtonHtml(actionLabel, actionUrl)}
          <div style="
            background:#FFF4DD;
            border:1px solid #E8C98E;
            border-radius:18px;
            margin:30px 0 0;
            padding:16px 18px;
            text-align:left;
          ">
            <p style="
              color:#5A301C;
              font-family:Arial,sans-serif;
              font-size:13px;
              font-weight:700;
              line-height:20px;
              margin:0;
            ">${note}</p>
          </div>
          <p style="
            color:#8A7564;
            font-family:Arial,sans-serif;
            font-size:12px;
            line-height:18px;
            margin:20px 0 0;
            word-break:break-all;
          ">Se o botao nao abrir, copie este link:<br>${actionUrl}</p>
        </div>
      </div>

      <p style="
        color:#8A7564;
        font-family:Arial,sans-serif;
        font-size:12px;
        line-height:18px;
        margin:18px auto 0;
        max-width:620px;
        text-align:center;
      ">${footer}</p>
      </div>
  `;
}

function logoAttachment() {
  return {
    cid: logoCid,
    contentType: "image/png",
    filename: "tejopan-logo.png",
    path: logoPath,
  };
}

async function sendEmail({ to, subject, html, text, attachments = [] }) {
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
        htmlContent: html.replace(`cid:${logoCid}`, getLogoUrl()),
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
    attachments,
  });
}

async function sendVerificationEmail({ email, name, token }) {
  const url = `${getAppUrl()}/verify-email?token=${token}`;
  const displayName = escapeHtml(name);

  return sendEmail({
    to: email,
    subject: "Confirme sua conta na TEJOPAN",
    html: emailShell({
      eyebrow: "Primeiro acesso",
      title: "Confirme seu e-mail",
      intro: `Ola, ${displayName}. Sua conta na TEJOPAN esta quase pronta. Confirme seu e-mail para liberar seu acesso.`,
      actionLabel: "Confirmar minha conta",
      actionUrl: url,
      note: "Este link expira em 24 horas. Se voce nao criou essa conta, ignore este e-mail.",
      footer: "TEJOPAN - feito com massa, recheado de tradicao.",
    }),
    text: `Confirme sua conta na TEJOPAN: ${url}`,
    attachments: [logoAttachment()],
  });
}

async function sendPasswordResetEmail({ email, name, token }) {
  const url = `${getAppUrl()}/reset-password?token=${token}`;
  const displayName = escapeHtml(name);

  return sendEmail({
    to: email,
    subject: "Redefina sua senha na TEJOPAN",
    html: emailShell({
      eyebrow: "Recuperacao de senha",
      title: "Crie uma nova senha",
      intro: `Ola, ${displayName}. Recebemos uma solicitacao para redefinir a senha da sua conta TEJOPAN.`,
      actionLabel: "Criar nova senha",
      actionUrl: url,
      note: "Este link expira em 1 hora. Se voce nao solicitou essa alteracao, ignore este e-mail.",
      footer: "TEJOPAN - sua padaria protegida em cada acesso.",
    }),
    text: `Redefina sua senha na TEJOPAN: ${url}`,
    attachments: [logoAttachment()],
  });
}

module.exports = {
  sendPasswordResetEmail,
  sendVerificationEmail,
};
