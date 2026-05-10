import { ReactNode, useEffect, useRef } from "react";
import {
  Animated,
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
import { ShieldCheck, Sparkles } from "lucide-react-native";

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
  const isWide = width >= 920;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.38],
  });

  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1.04],
  });

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
            <Animated.View
              style={[
                styles.heroGlow,
                styles.noPointer,
                {
                  opacity: glowOpacity,
                  transform: [{ scale: glowScale }],
                },
              ]}
            />

            <View style={styles.heroImageFrame}>
              <Image
                source={require("../assets/images/login-hero.png")}
                resizeMode="cover"
                style={styles.heroImage}
              />
            </View>

            <View style={styles.trustRow}>
              <View style={styles.trustItem}>
                <ShieldCheck size={18} color="#0F5E53" />
                <Text style={styles.trustText}>Acesso protegido</Text>
              </View>
              <View style={styles.trustItem}>
                <Sparkles size={18} color="#B95D42" />
                <Text style={styles.trustText}>Experiencia fluida</Text>
              </View>
            </View>
          </View>

          <View style={[styles.formPane, isWide ? styles.formWide : styles.formNarrow]}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={styles.formBody}>{children}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#F6F3EE",
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  scrollWide: {
    flexDirection: "row",
    gap: 58,
  },
  scrollNarrow: {
    gap: 26,
  },
  heroPane: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  heroWide: {
    maxWidth: 560,
    width: "46%",
  },
  heroNarrow: {
    maxWidth: 360,
    width: "100%",
  },
  heroGlow: {
    backgroundColor: "#68B3A7",
    borderRadius: 999,
    height: 360,
    position: "absolute",
    width: 360,
  },
  noPointer: {
    pointerEvents: "none",
  },
  heroImageFrame: {
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderColor: "#E5DED2",
    borderRadius: 30,
    borderWidth: 1,
    maxWidth: 460,
    overflow: "hidden",
    width: "100%",
    ...Platform.select({
      web: {
        boxShadow: "0 26px 32px rgba(39, 53, 47, 0.18)",
      },
      default: {
        shadowColor: "#27352F",
        shadowOffset: { width: 0, height: 26 },
        shadowOpacity: 0.18,
        shadowRadius: 32,
        elevation: 8,
      },
    }),
  },
  heroImage: {
    height: "100%",
    width: "100%",
  },
  trustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginTop: 18,
  },
  trustItem: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E5DED2",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 14,
  },
  trustText: {
    color: "#25342F",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0,
  },
  formPane: {
    width: "100%",
  },
  formWide: {
    maxWidth: 450,
  },
  formNarrow: {
    maxWidth: 520,
  },
  eyebrow: {
    color: "#B95D42",
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
