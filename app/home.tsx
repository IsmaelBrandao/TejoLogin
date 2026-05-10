import { Platform, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { CheckCircle2, LogOut, ShieldCheck } from "lucide-react-native";

import { AuthButton } from "@/components/AuthButton";

export default function HomeScreen() {
  const params = useLocalSearchParams<{ name?: string; email?: string }>();
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const displayName = params.name || "voce";

  return (
    <View style={styles.screen}>
      <View style={[styles.panel, isWide ? styles.panelWide : styles.panelNarrow]}>
        <View style={styles.iconBadge}>
          <CheckCircle2 size={34} color="#0F5E53" />
        </View>

        <Text style={styles.eyebrow}>Acesso liberado</Text>
        <Text style={styles.title}>Ola, {displayName}</Text>
        <Text style={styles.subtitle}>
          Sua conta esta pronta para continuar em qualquer dispositivo conectado.
        </Text>

        <View style={styles.statusBox}>
          <ShieldCheck size={22} color="#0F5E53" />
          <View style={styles.statusTextGroup}>
            <Text style={styles.statusTitle}>Sessao segura</Text>
            <Text style={styles.statusText}>
              {params.email || "Seu acesso"} foi validado com sucesso.
            </Text>
          </View>
        </View>

        <AuthButton
          icon={<LogOut size={20} color="#FFFFFF" />}
          onPress={() => router.replace("/")}
        >
          Sair
        </AuthButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    backgroundColor: "#F6F3EE",
    flex: 1,
    justifyContent: "center",
    padding: 22,
  },
  panel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5DED2",
    borderRadius: 28,
    borderWidth: 1,
    gap: 18,
    padding: 26,
    ...Platform.select({
      web: {
        boxShadow: "0 20px 30px rgba(39, 53, 47, 0.13)",
      },
      default: {
        shadowColor: "#27352F",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.13,
        shadowRadius: 30,
        elevation: 8,
      },
    }),
  },
  panelWide: {
    maxWidth: 520,
    width: "100%",
  },
  panelNarrow: {
    width: "100%",
  },
  iconBadge: {
    alignItems: "center",
    backgroundColor: "#E7F2EA",
    borderRadius: 22,
    height: 68,
    justifyContent: "center",
    width: 68,
  },
  eyebrow: {
    color: "#B95D42",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: "#17211D",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 40,
  },
  subtitle: {
    color: "#5B625C",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0,
    lineHeight: 24,
  },
  statusBox: {
    alignItems: "center",
    backgroundColor: "#F6F3EE",
    borderColor: "#E5DED2",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  statusTextGroup: {
    flex: 1,
    gap: 4,
  },
  statusTitle: {
    color: "#17211D",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0,
  },
  statusText: {
    color: "#5B625C",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0,
    lineHeight: 20,
  },
});
