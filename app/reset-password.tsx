import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, LockKeyhole, Save } from "lucide-react-native";

import { AuthButton } from "@/components/AuthButton";
import { AuthInput } from "@/components/AuthInput";
import { AuthScaffold } from "@/components/AuthScaffold";
import { apiRequest, ApiMessage } from "@/lib/api";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const token = String(params.token || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const canSubmit = useMemo(
    () => token.length >= 32 && password.length >= 6 && password === confirmPassword,
    [confirmPassword, password, token]
  );

  async function handleResetPassword() {
    setMessage("");
    setSuccess(false);

    if (!canSubmit) {
      setMessage("Digite uma senha com pelo menos 6 caracteres e confirme a mesma senha.");
      return;
    }

    try {
      setLoading(true);
      const result = await apiRequest<ApiMessage>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      setSuccess(true);
      setMessage(result.message);
    } catch (error) {
      setSuccess(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel atualizar sua senha agora."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScaffold
      eyebrow="Nova senha"
      title="Recupere seu acesso"
      subtitle="Crie uma nova senha para voltar a entrar com seguranca."
    >
      <AuthInput
        autoCapitalize="none"
        icon={<LockKeyhole size={21} color="#8A4A24" />}
        label="Nova senha"
        onChangeText={setPassword}
        placeholder="Digite a nova senha"
        returnKeyType="next"
        secureTextEntry
        secureToggle
        value={password}
      />

      <AuthInput
        autoCapitalize="none"
        icon={<LockKeyhole size={21} color="#8A4A24" />}
        label="Confirmar nova senha"
        onChangeText={setConfirmPassword}
        onSubmitEditing={handleResetPassword}
        placeholder="Repita a nova senha"
        returnKeyType="go"
        secureTextEntry
        secureToggle
        value={confirmPassword}
      />

      {message ? (
        <Text style={[styles.feedback, success ? styles.success : styles.error]}>
          {message}
        </Text>
      ) : null}

      <AuthButton
        disabled={!canSubmit}
        icon={<Save size={19} color="#FFF7EA" />}
        loading={loading}
        onPress={handleResetPassword}
      >
        Salvar nova senha
      </AuthButton>

      <View style={styles.footerRow}>
        <Pressable onPress={() => router.replace("/")} style={styles.backLink}>
          <ArrowLeft size={18} color="#8A4A24" />
          <Text style={styles.backText}>Voltar para login</Text>
        </Pressable>
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
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
  success: {
    backgroundColor: "#E7F2EA",
    borderColor: "#C5DEC9",
    color: "#1E5B35",
  },
  footerRow: {
    alignItems: "center",
  },
  backLink: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  backText: {
    color: "#8A4A24",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
  },
});
