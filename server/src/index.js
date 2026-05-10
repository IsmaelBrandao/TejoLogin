require("dotenv").config();

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const { z } = require("zod");

const { createToken, getBearerToken, verifyToken } = require("./auth");
const { ensureSchema, pool } = require("./db/pool");
const { sendPasswordResetEmail, sendVerificationEmail } = require("./mailer");
const { createActionToken, hashToken, hoursFromNow } = require("./tokens");

const app = express();
const port = Number(process.env.PORT || 3333);
const distPath = path.resolve(__dirname, "../../dist");
const indexHtmlPath = path.join(distPath, "index.html");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  email: z.email("Informe um e-mail valido.").transform((value) => value.toLowerCase()),
  password: z.string().min(6, "Use uma senha com pelo menos 6 caracteres."),
  confirmPassword: z.string().min(6, "Repita sua senha para continuar."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas precisam ser iguais.",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.email("Informe um e-mail valido.").transform((value) => value.toLowerCase()),
  password: z.string().min(6, "Use uma senha com pelo menos 6 caracteres."),
});

const recoverSchema = z.object({
  email: z.email("Informe um e-mail valido.").transform((value) => value.toLowerCase()),
});

const verifyEmailSchema = z.object({
  token: z.string().min(32, "Link de confirmacao invalido."),
});

const resendVerificationSchema = z.object({
  email: z.email("Informe um e-mail valido.").transform((value) => value.toLowerCase()),
});

const resetPasswordSchema = z.object({
  token: z.string().min(32, "Link de redefinicao invalido."),
  password: z.string().min(6, "Use uma senha com pelo menos 6 caracteres."),
  confirmPassword: z.string().min(6, "Repita sua senha para continuar."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas precisam ser iguais.",
  path: ["confirmPassword"],
});

function corsOptions() {
  const configuredOrigins = (process.env.CORS_ORIGIN || "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    origin(origin, callback) {
      if (!origin || configuredOrigins.includes("*") || configuredOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origem nao permitida pelo CORS."));
    },
  };
}

function sendValidationError(response, error) {
  const firstIssue = error.issues?.[0];
  response.status(400).json({
    message: firstIssue?.message || "Revise os dados enviados.",
  });
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: Boolean(user.email_verified_at),
  };
}

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(cors(corsOptions()));
app.use(express.json({ limit: "1mb" }));

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "tejologin-api",
  });
});

app.post("/auth/register", async (request, response, next) => {
  try {
    const parsed = registerSchema.safeParse(request.body);

    if (!parsed.success) {
      sendValidationError(response, parsed.error);
      return;
    }

    const { name, email, password } = parsed.data;
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

    if (existingUser.rowCount) {
      response.status(409).json({ message: "Este e-mail ja esta em uso." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verification = createActionToken();
    const result = await pool.query(
      `INSERT INTO users (
        id,
        name,
        email,
        password_hash,
        email_verification_token_hash,
        email_verification_expires_at
      )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, email_verified_at`,
      [
        crypto.randomUUID(),
        name,
        email,
        passwordHash,
        verification.tokenHash,
        hoursFromNow(24),
      ]
    );

    const user = result.rows[0];

    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token: verification.token,
    });

    response.status(201).json({
      ok: true,
      user: publicUser(user),
      message: "Enviamos um link de confirmacao para o seu e-mail.",
    });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/login", async (request, response, next) => {
  try {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
      sendValidationError(response, parsed.error);
      return;
    }

    const { email, password } = parsed.data;
    const result = await pool.query(
      "SELECT id, name, email, password_hash, email_verified_at FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    const validPassword = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!user || !validPassword) {
      response.status(401).json({ message: "Login ou senha invalidos." });
      return;
    }

    if (!user.email_verified_at) {
      response.status(403).json({
        message: "Confirme seu e-mail antes de entrar. Se precisar, solicite um novo link.",
      });
      return;
    }

    response.json({
      user: publicUser(user),
      token: createToken(user),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/recover", async (request, response, next) => {
  try {
    const parsed = recoverSchema.safeParse(request.body);

    if (!parsed.success) {
      sendValidationError(response, parsed.error);
      return;
    }

    const { email } = parsed.data;
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];

    if (user) {
      const reset = createActionToken();

      await pool.query(
        `UPDATE users
         SET password_reset_token_hash = $1,
             password_reset_expires_at = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [reset.tokenHash, hoursFromNow(1), user.id]
      );

      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        token: reset.token,
      });
    }

    response.json({
      ok: true,
      message: "Se este e-mail estiver cadastrado, enviaremos as instrucoes.",
    });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/verify-email", async (request, response, next) => {
  try {
    const parsed = verifyEmailSchema.safeParse(request.body);

    if (!parsed.success) {
      sendValidationError(response, parsed.error);
      return;
    }

    const tokenHash = hashToken(parsed.data.token);
    const result = await pool.query(
      `UPDATE users
       SET email_verified_at = NOW(),
           email_verification_token_hash = NULL,
           email_verification_expires_at = NULL,
           updated_at = NOW()
       WHERE email_verification_token_hash = $1
         AND email_verification_expires_at > NOW()
       RETURNING id, name, email, email_verified_at`,
      [tokenHash]
    );
    const user = result.rows[0];

    if (!user) {
      response.status(400).json({
        message: "Link de confirmacao invalido ou expirado.",
      });
      return;
    }

    response.json({
      ok: true,
      user: publicUser(user),
      message: "E-mail confirmado. Voce ja pode entrar.",
    });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/resend-verification", async (request, response, next) => {
  try {
    const parsed = resendVerificationSchema.safeParse(request.body);

    if (!parsed.success) {
      sendValidationError(response, parsed.error);
      return;
    }

    const result = await pool.query(
      "SELECT id, name, email, email_verified_at FROM users WHERE email = $1",
      [parsed.data.email]
    );
    const user = result.rows[0];

    if (user && !user.email_verified_at) {
      const verification = createActionToken();

      await pool.query(
        `UPDATE users
         SET email_verification_token_hash = $1,
             email_verification_expires_at = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [verification.tokenHash, hoursFromNow(24), user.id]
      );

      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        token: verification.token,
      });
    }

    response.json({
      ok: true,
      message: "Se a conta estiver pendente, enviaremos um novo link de confirmacao.",
    });
  } catch (error) {
    next(error);
  }
});

app.post("/auth/reset-password", async (request, response, next) => {
  try {
    const parsed = resetPasswordSchema.safeParse(request.body);

    if (!parsed.success) {
      sendValidationError(response, parsed.error);
      return;
    }

    const tokenHash = hashToken(parsed.data.token);
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1,
           password_reset_token_hash = NULL,
           password_reset_expires_at = NULL,
           updated_at = NOW()
       WHERE password_reset_token_hash = $2
         AND password_reset_expires_at > NOW()
       RETURNING id`,
      [passwordHash, tokenHash]
    );

    if (!result.rowCount) {
      response.status(400).json({
        message: "Link de redefinicao invalido ou expirado.",
      });
      return;
    }

    response.json({
      ok: true,
      message: "Senha atualizada. Voce ja pode entrar.",
    });
  } catch (error) {
    next(error);
  }
});

app.get("/auth/me", async (request, response) => {
  const token = getBearerToken(request.headers.authorization);

  if (!token) {
    response.status(401).json({ message: "Acesso nao autorizado." });
    return;
  }

  try {
    const payload = verifyToken(token);
    response.json({
      user: {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
      },
    });
  } catch {
    response.status(401).json({ message: "Sessao expirada. Entre novamente." });
  }
});

if (fs.existsSync(indexHtmlPath)) {
  app.use((request, response, next) => {
    const acceptsHtml = request.headers.accept?.includes("text/html");

    if (request.method !== "GET" || !acceptsHtml || request.path.startsWith("/auth")) {
      next();
      return;
    }

    response.sendFile(indexHtmlPath);
  });
}

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({
    message: "Nao foi possivel concluir sua solicitacao agora.",
  });
});

ensureSchema()
  .then(() => {
    app.listen(port, () => {
      console.log(`API pronta em http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Falha ao iniciar a API:", error.message);
    process.exit(1);
  });
