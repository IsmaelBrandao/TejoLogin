import { ReactNode } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

type AuthScaffoldProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthScaffold({
  eyebrow,
  title,
  subtitle,
  children,
}: AuthScaffoldProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            isWide ? styles.scrollWide : styles.scrollNarrow,
          ]}
        >
          <View style={[styles.heroPane, isWide ? styles.heroWide : styles.heroNarrow]}>
            <Image
              source={require("../assets/images/bakery-login.png")}
              resizeMode="cover"
              style={[styles.heroImage, isWide ? styles.heroImageWide : null]}
            />
            <View style={styles.heroOverlay} />

            <View style={[styles.heroCopy, !isWide && styles.heroCopyNarrow]}>
              <Text style={styles.heroKicker}>Padaria TejoLogin</Text>
              <Text style={[styles.heroTitle, !isWide && styles.heroTitleNarrow]}>
                O acesso da sua padaria comeca aqui.
              </Text>
              <Text style={styles.heroSubtitle}>
                Entre para acompanhar pedidos, fornadas e atendimentos em um so lugar.
              </Text>
            </View>
          </View>

          <View style={[styles.formPane, isWide ? styles.formWide : styles.formNarrow]}>
            <View style={styles.formContent}>
              <Text style={styles.brand}>TejoLogin</Text>
              <Text style={styles.eyebrow}>{eyebrow}</Text>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
              <View style={styles.formBody}>{children}</View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FFF8EE",
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollWide: {
    flexDirection: "row",
    minHeight: "100%",
  },
  scrollNarrow: {
    paddingBottom: 28,
  },
  heroPane: {
    backgroundColor: "#5A301C",
    overflow: "hidden",
    position: "relative",
  },
  heroWide: {
    alignSelf: "stretch",
    minHeight: 760,
    width: "58%",
  },
  heroNarrow: {
    height: 330,
    width: "100%",
  },
  heroImage: {
    bottom: 0,
    height: "100%",
    opacity: 0.44,
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%",
  },
  heroImageWide: {
    width: "118%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(69, 30, 11, 0.54)",
  },
  heroCopy: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 560,
    paddingHorizontal: 44,
    paddingVertical: 42,
    position: "relative",
    zIndex: 1,
  },
  heroCopyNarrow: {
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  heroKicker: {
    color: "#F4C46B",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: "#FFF7EA",
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 54,
  },
  heroTitleNarrow: {
    fontSize: 34,
    lineHeight: 40,
  },
  heroSubtitle: {
    color: "#F7DCC2",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 28,
    marginTop: 18,
  },
  formPane: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 44,
    width: "100%",
  },
  formWide: {
    alignSelf: "stretch",
    flex: 1,
  },
  formNarrow: {
    alignSelf: "center",
  },
  formContent: {
    maxWidth: 470,
    width: "100%",
  },
  brand: {
    color: "#4A2414",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 28,
  },
  eyebrow: {
    color: "#C35F2F",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  title: {
    color: "#17211D",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 48,
  },
  subtitle: {
    color: "#5B625C",
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: 0,
    lineHeight: 26,
    marginTop: 14,
  },
  formBody: {
    gap: 18,
    marginTop: 32,
  },
});
