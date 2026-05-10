import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ArrowRight, LockKeyhole, Mail, Send } from "lucide-react-native";

import { AuthButton } from "@/components/AuthButton";
import { AuthInput } from "@/components/AuthInput";
import { AuthScaffold } from "@/components/AuthScaffold";
import { apiRequest, ApiMessage, AuthPayload } from "@/lib/api";

export default function LoginScreen() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [info, setInfo] = useState(false);

  const canSubmit = useMemo(
    () => login.trim().length > 2 && password.length >= 6,
    [login, password]
  );

  async function handleLogin() {
    setMessage("");
    setInfo(false);

    if (!canSubmit) {
      setMessage("Preencha seu acesso e uma senha valida para continuar.");
      return;
    }

    try {
      setLoading(true);
      const auth = await apiRequest<AuthPayload>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: login.trim().toLowerCase(),
          password,
        }),
      });

      router.replace({
        pathname: "/home",
        params: {
          name: auth.user.name,
          email: auth.user.email,
        },
      });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel entrar. Tente novamente em instantes."
      );
      setInfo(error instanceof Error && error.message.includes("Confirme seu e-mail"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    const email = login.trim().toLowerCase();

    if (!email.includes("@")) {
      setMessage("Informe seu e-mail para reenviar a confirmacao.");
      setInfo(false);
      return;
    }

    try {
      setResending(true);
      const result = await apiRequest<ApiMessage>("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setInfo(true);
      setMessage(result.message);
    } catch (error) {
      setInfo(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel reenviar a confirmacao agora."
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthScaffold
      eyebrow="Bem-vindo de volta"
      title="Entre na sua conta"
      subtitle="Acesse seu espaco com seguranca e continue de onde parou."
    >
      <AuthInput
        autoCapitalize="none"
        autoComplete="email"
        icon={<Mail size={21} color="#8A4A24" />}
        keyboardType="email-address"
        label="Login"
        onChangeText={setLogin}
        placeholder="seuemail@exemplo.com"
        returnKeyType="next"
        value={login}
      />

      <AuthInput
        autoCapitalize="none"
        icon={<LockKeyhole size={21} color="#8A4A24" />}
        label="Senha"
        onChangeText={setPassword}
        onSubmitEditing={handleLogin}
        placeholder="Digite sua senha"
        returnKeyType="go"
        secureTextEntry
        secureToggle
        value={password}
      />

      <View style={styles.actionsRow}>
        <Pressable onPress={() => router.push("/recover")} style={styles.linkHitArea}>
          <Text style={styles.link}>Esqueci minha senha</Text>
        </Pressable>
      </View>

      {message ? (
        <Text style={[styles.feedback, info ? styles.info : styles.error]}>
          {message}
        </Text>
      ) : null}

      {info ? (
        <AuthButton
          icon={<Send size={19} color="#5A301C" />}
          loading={resending}
          onPress={handleResendVerification}
          variant="secondary"
        >
          Reenviar confirmacao
        </AuthButton>
      ) : null}

      <AuthButton
        disabled={!canSubmit}
        icon={<ArrowRight size={20} color="#FFF7EA" />}
        loading={loading}
        onPress={handleLogin}
      >
        Acessar aplicativo
      </AuthButton>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Ainda nao tem acesso?</Text>
        <Pressable onPress={() => router.push("/register")} style={styles.linkHitArea}>
          <Text style={styles.linkStrong}>Criar uma conta</Text>
        </Pressable>
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: -4,
  },
  linkHitArea: {
    paddingVertical: 4,
  },
  link: {
    color: "#8A4A24",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0,
  },
  feedback: {
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: {
    backgroundColor: "#F9E8E4",
    borderColor: "#F0C3BA",
    color: "#963D35",
  },
  info: {
    backgroundColor: "#E7F2EA",
    borderColor: "#C5DEC9",
    color: "#1E5B35",
  },
  footerRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    justifyContent: "center",
  },
  footerText: {
    color: "#646B65",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0,
  },
  linkStrong: {
    color: "#B95D42",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
  },
});
