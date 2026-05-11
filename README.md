# TEJOPAN

Projeto Expo com tela de login responsiva, rotas de cadastro/recuperacao e API Node conectada a Postgres.

## Stack

- Expo + React Native + Expo Router
- UI responsiva para web e mobile
- Icones com `lucide-react-native`
- API Express
- Postgres local via Docker ou Postgres hospedado por `DATABASE_URL`
- E-mail transacional com Brevo API e fallback SMTP com `nodemailer`

## Rodando localmente

1. Instale as dependencias do app:

   ```bash
   npm install
   ```

2. Instale as dependencias da API:

   ```bash
   npm --prefix server install
   ```

3. Crie os arquivos de ambiente:

   ```powershell
   Copy-Item .env.example .env
   Copy-Item server/.env.example server/.env
   ```

4. Suba o Postgres local:

   ```bash
   docker compose up -d
   ```

5. Inicie a API:

   ```bash
   npm run api:dev
   ```

6. Em outro terminal, inicie o app:

   ```bash
   npm run web
   ```

## Deploy no Render

O arquivo `render.yaml` esta pronto como Blueprint. Ele cria:

- um Web Service gratuito chamado `tejologin`
- um Postgres gratuito chamado `tejologin-db`
- o build estatico do Expo Web em `dist`
- a API Node servindo o frontend e os endpoints `/auth/*` no mesmo dominio

No Render:

1. Conecte o repositorio.
2. Escolha Blueprint e selecione o `render.yaml`.
3. Preencha os secrets solicitados:
   - `APP_URL`: a URL publica do servico, por exemplo `https://tejologin.onrender.com`
   - `BREVO_API_KEY`: sua chave da Brevo
   - `MAIL_FROM`: `TEJOPAN <ismaelbrandao2003@gmail.com>` ou outro remetente verificado

O `DATABASE_URL` e o `JWT_SECRET` sao gerados automaticamente pelo Blueprint.

Se preferir frontend e API em dominios separados, defina `EXPO_PUBLIC_API_URL` no build do frontend com a URL da API. No Blueprint atual isso nao e necessario porque tudo roda no mesmo Web Service.

Para testar o mesmo build localmente:

```bash
npm run build:web
npm run api:start
```

## E-mails de confirmacao e recuperacao

A API usa Brevo por HTTP quando `BREVO_API_KEY` esta configurado. Esse e o caminho recomendado no Render gratuito, porque evita depender de portas SMTP. Para envio real gratuito, crie uma chave na Brevo e configure:

```bash
BREVO_API_KEY=sua-chave-api
MAIL_FROM="TEJOPAN <no-reply@seudominio.com>"
```

Tambem existe fallback com `nodemailer` via SMTP para desenvolvimento local ou hospedagens que liberam SMTP:

```bash
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=seu-login-smtp
SMTP_PASS=sua-chave-smtp
MAIL_FROM="TEJOPAN <no-reply@seudominio.com>"
```

Sem `BREVO_API_KEY` e sem SMTP, o conteudo do e-mail aparece no console da API em modo dev.

Os templates de confirmacao e recuperacao usam a logo em `/email-assets/tejopan-email-logo.png`. No deploy, mantenha `APP_URL` apontando para a URL publica do Render para a imagem aparecer corretamente nos clientes de e-mail.

Fluxo implementado:

- cadastro cria a conta como pendente e envia `/verify-email?token=...`
- login so libera acesso depois da confirmacao do e-mail
- recuperacao envia `/reset-password?token=...`
- os tokens sao salvos no banco apenas como hash e expiram automaticamente

## Rotas

- `/` login
- `/register` criar conta
- `/recover` recuperar senha
- `/verify-email` confirmar e-mail
- `/reset-password` criar nova senha
- `/home` area logada
