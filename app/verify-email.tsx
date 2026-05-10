import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, CheckCircle2, MailCheck } from "lucide-react-native";

import { AuthButton } from "@/components/AuthButton";
import { AuthScaffold } from "@/components/AuthScaffold";
import { apiRequest, ApiMessage } from "@/lib/api";

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const token = useMemo(() => String(params.token || ""), [params.token]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Confirmando seu e-mail...");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    async function verify() {
      if (!token) {
        setLoading(false);
        setSuccess(false);
        setMessage("Link de confirmacao invalido.");
        return;
      }

      try {
        const result = await apiRequest<ApiMessage>("/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token }),
        });

        if (!active) {
          return;
        }

        setSuccess(true);
        setMessage(result.message);
      } catch (error) {
        if (!active) {
          return;
        }

        setSuccess(false);
        setMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel confirmar seu e-mail agora."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    verify();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <AuthScaffold
      eyebrow="Confirmacao"
      title="Valide seu acesso"
      subtitle="Estamos conferindo o link para liberar sua conta com seguranca."
    >
      <View style={[styles.statusCard, success ? styles.successCard : styles.errorCard]}>
        {success ? (
          <CheckCircle2 size={28} color="#1E5B35" />
        ) : (
          <MailCheck size={28} color="#963D35" />
        )}
        <Text style={[styles.statusText, success ? styles.successText : styles.errorText]}>
          {message}
        </Text>
      </View>

      <AuthButton loading={loading} onPress={() => router.replace("/")}>
        Entrar na conta
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
  statusCard: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  successCard: {
    backgroundColor: "#E7F2EA",
    borderColor: "#C5DEC9",
  },
  errorCard: {
    backgroundColor: "#F9E8E4",
    borderColor: "#F0C3BA",
  },
  statusText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 22,
  },
  successText: {
    color: "#1E5B35",
  },
  errorText: {
    color: "#963D35",
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
