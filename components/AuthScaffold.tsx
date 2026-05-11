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
  const isWaitingForWebWidth = Platform.OS === "web" && (!width || width < 1);
  const isWide = isWaitingForWebWidth || width >= 900;
  const isCompact = !isWide && width < 560;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View
            nativeID="auth-shell"
            style={[
              styles.shell,
              isWide ? styles.scrollWide : styles.scrollNarrow,
            ]}
          >
            <View
              nativeID="auth-hero"
              style={[
                styles.heroPane,
                isWide ? styles.heroWide : styles.heroNarrow,
                isCompact && styles.heroCompact,
              ]}
            >
              <Image
                nativeID="auth-hero-image"
                source={require("../assets/images/bakery-login.png")}
                resizeMode="cover"
                style={[
                  styles.heroImage,
                  isWide ? styles.heroImageWide : styles.heroImageNarrow,
                ]}
              />
              <View style={styles.heroOverlay} />

              <View
                nativeID="auth-hero-copy"
                style={[
                  styles.heroCopy,
                  !isWide && styles.heroCopyNarrow,
                  isCompact && styles.heroCopyCompact,
                ]}
              >
                <Text style={styles.heroKicker}>Padaria TEJOPAN</Text>
                <Text
                  nativeID="auth-hero-title"
                  style={[
                    styles.heroTitle,
                    !isWide && styles.heroTitleNarrow,
                    isCompact && styles.heroTitleCompact,
                  ]}
                >
                  O acesso da sua padaria comeca aqui.
                </Text>
                <Text
                  nativeID="auth-hero-subtitle"
                  style={[styles.heroSubtitle, isCompact && styles.heroSubtitleCompact]}
                >
                  Entre para acompanhar pedidos, fornadas e atendimentos em um so lugar.
                </Text>
              </View>
            </View>

            <View
              nativeID="auth-form-pane"
              style={[
                styles.formPane,
                isWide ? styles.formWide : styles.formNarrow,
                isCompact && styles.formCompact,
              ]}
            >
              <View
                nativeID="auth-form-content"
                style={[styles.formContent, isCompact && styles.formContentCompact]}
              >
                <View style={styles.logoWrap}>
                  <Image
                    nativeID="auth-logo"
                    accessibilityLabel="TEJOPAN"
                    resizeMode="contain"
                    source={require("../assets/images/tejopan-logo.png")}
                    style={[styles.logo, isCompact && styles.logoCompact]}
                  />
                </View>
                <View style={styles.formDivider}>
                  <View style={styles.formDividerLine} />
                  <View style={styles.formDividerDot} />
                  <View style={styles.formDividerLine} />
                </View>
                <Text style={[styles.eyebrow, isCompact && styles.eyebrowCompact]}>
                  {eyebrow}
                </Text>
                <Text
                  nativeID="auth-title"
                  style={[
                    styles.title,
                    isCompact && styles.titleCompact,
                  ]}
                >
                  {title}
                </Text>
                <Text
                  nativeID="auth-subtitle"
                  style={[styles.subtitle, isCompact && styles.subtitleCompact]}
                >
                  {subtitle}
                </Text>
                <View style={[styles.formBody, isCompact && styles.formBodyCompact]}>
                  {children}
                </View>
              </View>
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
  shell: {
    flexGrow: 1,
    width: "100%",
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
    height: 320,
    width: "100%",
  },
  heroCompact: {
    height: 300,
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
  heroImageNarrow: {
    width: "100%",
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
  heroCopyCompact: {
    paddingHorizontal: 22,
    paddingVertical: 26,
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
  heroTitleCompact: {
    fontSize: 30,
    lineHeight: 36,
  },
  heroSubtitle: {
    color: "#F7DCC2",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 28,
    marginTop: 18,
  },
  heroSubtitleCompact: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
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
  formCompact: {
    paddingHorizontal: 22,
    paddingVertical: 34,
  },
  formContent: {
    maxWidth: 470,
    width: "100%",
  },
  formContentCompact: {
    maxWidth: 430,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 14,
    width: "100%",
  },
  logo: {
    height: 132,
    maxWidth: 320,
    width: "72%",
  },
  logoCompact: {
    height: 104,
    maxWidth: 250,
    width: "70%",
  },
  formDivider: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 24,
  },
  formDividerLine: {
    backgroundColor: "#D5A35F",
    height: 2,
    maxWidth: 72,
    opacity: 0.65,
    width: "22%",
  },
  formDividerDot: {
    backgroundColor: "#C35F2F",
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  eyebrow: {
    color: "#C35F2F",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  eyebrowCompact: {
    fontSize: 12,
  },
  title: {
    color: "#25160F",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 48,
  },
  titleCompact: {
    fontSize: 34,
    lineHeight: 40,
  },
  subtitle: {
    color: "#6B594B",
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: 0,
    lineHeight: 26,
    marginTop: 14,
  },
  subtitleCompact: {
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
  },
  formBody: {
    gap: 18,
    marginTop: 32,
  },
  formBodyCompact: {
    gap: 15,
    marginTop: 26,
  },
});
