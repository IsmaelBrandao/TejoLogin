const path = require("path");
const nodemailer = require("nodemailer");

const logoPath = path.resolve(__dirname, "../../assets/images/tejopan-email-logo.png");
const logoCid = "tejopan-logo";
const fallbackPublicUrl = "https://tejologin.onrender.com";

function normalizeUrl(value) {
  return value ? value.replace(/\/$/, "") : "";
}

function isLocalUrl(value) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/i.test(value);
}

function getAppUrl() {
  return normalizeUrl(
    process.env.APP_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      "http://localhost:8081"
  );
}

function getEmailAssetBaseUrl() {
  const configuredUrl = normalizeUrl(
    process.env.EMAIL_ASSET_BASE_URL ||
      process.env.EMAIL_PUBLIC_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      process.env.APP_URL
  );

  if (configuredUrl && !isLocalUrl(configuredUrl)) {
    return configuredUrl;
  }

  return fallbackPublicUrl;
}

function getLogoUrl() {
  return `${getEmailAssetBaseUrl()}/email-assets/tejopan-email-logo.png?v=20260511`;
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
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="border-collapse:separate;margin:0 auto;width:auto;">
      <tr>
        <td class="button-cell" bgcolor="#8A4A24" style="background:#8A4A24;border:1px solid #B87938;border-radius:16px;box-shadow:0 14px 26px rgba(116,63,31,.24);text-align:center;">
          <a class="button" href="${url}" style="color:#FFF7EA;display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:800;min-width:220px;padding:16px 24px;text-decoration:none;text-align:center;">${label}</a>
        </td>
      </tr>
    </table>
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
  const safeActionUrl = escapeHtml(actionUrl);

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <style>
          @media only screen and (max-width: 600px) {
            .outer { padding: 0 !important; }
            .container { border-left: 0 !important; border-right: 0 !important; border-radius: 0 !important; width: 100% !important; }
            .header { padding: 24px 18px 18px !important; }
            .logo { max-width: 190px !important; width: 190px !important; }
            .content { padding: 28px 20px 26px !important; }
            .divider-line { width: 42px !important; }
            .eyebrow { font-size: 11px !important; }
            .title { font-size: 26px !important; line-height: 32px !important; }
            .intro { font-size: 15px !important; line-height: 23px !important; }
            .button-cell { display: block !important; width: 100% !important; }
            .button { box-sizing: border-box !important; display: block !important; min-width: 0 !important; padding: 15px 18px !important; width: 100% !important; }
            .note { padding: 14px !important; }
            .link-copy { font-size: 11px !important; line-height: 17px !important; }
            .footer { padding: 0 18px 22px !important; }
          }
        </style>
      </head>
      <body style="background:#FFF8EE;margin:0;padding:0;width:100%;">
        <span style="color:transparent;display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${title} - TEJOPAN</span>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#FFF8EE;border-collapse:collapse;margin:0;padding:0;width:100%;">
          <tr>
            <td class="outer" align="center" style="padding:36px 16px;">
              <table class="container" role="presentation" width="620" cellspacing="0" cellpadding="0" border="0" style="background:#FFFDF7;border:1px solid #E5CDA8;border-collapse:separate;border-radius:28px;box-shadow:0 18px 44px rgba(74,36,20,.12);max-width:620px;overflow:hidden;width:100%;">
                <tr>
                  <td class="header" align="center" bgcolor="#4A2414" style="background:#4A2414;padding:28px 28px 22px;text-align:center;">
                    <img class="logo" src="${logoSrc}" width="230" alt="TEJOPAN" style="border:0;display:block;height:auto;margin:0 auto;max-width:230px;outline:none;text-decoration:none;width:230px;" />
                  </td>
                </tr>
                <tr>
                  <td class="content" align="center" style="padding:34px 34px 30px;text-align:center;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto 22px;">
                      <tr>
                        <td class="divider-line" style="background:#F5E0BD;border-radius:999px;font-size:0;height:7px;line-height:7px;width:54px;">&nbsp;</td>
                        <td style="font-size:0;line-height:0;width:14px;">&nbsp;</td>
                        <td style="background:#C35F2F;border-radius:999px;font-size:0;height:8px;line-height:8px;width:8px;">&nbsp;</td>
                        <td style="font-size:0;line-height:0;width:14px;">&nbsp;</td>
                        <td class="divider-line" style="background:#F5E0BD;border-radius:999px;font-size:0;height:7px;line-height:7px;width:54px;">&nbsp;</td>
                      </tr>
                    </table>

                    <p class="eyebrow" style="color:#C35F2F;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:900;letter-spacing:.04em;margin:0 0 12px;text-transform:uppercase;">${eyebrow}</p>
                    <h1 class="title" style="color:#25160F;font-family:Arial,Helvetica,sans-serif;font-size:32px;font-weight:900;line-height:38px;margin:0 0 14px;">${title}</h1>
                    <p class="intro" style="color:#6B594B;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:500;line-height:25px;margin:0 auto 28px;max-width:470px;">${intro}</p>
                    ${buildButtonHtml(actionLabel, safeActionUrl)}

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;margin:30px 0 0;width:100%;">
                      <tr>
                        <td class="note" style="background:#FFF4DD;border:1px solid #E8C98E;border-radius:18px;padding:16px 18px;text-align:left;">
                          <p style="color:#5A301C;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;line-height:20px;margin:0;">${note}</p>
                        </td>
                      </tr>
                    </table>

                    <p class="link-copy" style="color:#8A7564;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;margin:20px 0 0;word-break:break-all;">Se o botao nao abrir, copie este link:<br>${safeActionUrl}</p>
                  </td>
                </tr>
              </table>

              <p class="footer" style="color:#8A7564;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;margin:18px auto 0;max-width:620px;text-align:center;">${footer}</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
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
