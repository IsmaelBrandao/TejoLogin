import { ReactNode, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

type AuthButtonProps = {
  children: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export function AuthButton({
  children,
  icon,
  loading,
  disabled,
  variant = "primary",
  style,
  onPress,
}: AuthButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function animate(toValue: number) {
    Animated.spring(scale, {
      toValue,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }

  const isDisabled = Boolean(disabled || loading);

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={() => animate(0.97)}
      onPressOut={() => animate(1)}
      style={styles.pressable}
    >
      <Animated.View
        style={[
          styles.button,
          variant === "primary" ? styles.primary : styles.secondary,
          isDisabled && styles.disabled,
          { transform: [{ scale }] },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === "primary" ? "#FFF7EA" : "#5A301C"} />
        ) : (
          <View style={styles.content}>
            <Text
              style={[
                styles.label,
                variant === "primary" ? styles.primaryLabel : styles.secondaryLabel,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {children}
            </Text>
            {icon}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 20,
  },
  button: {
    alignItems: "center",
    borderRadius: 20,
    minHeight: 60,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: "#8A4A24",
    borderColor: "#B87938",
    borderWidth: 1,
    ...Platform.select({
      web: {
        boxShadow: "0 18px 30px rgba(116, 63, 31, 0.28)",
      },
      default: {
        shadowColor: "#743F1F",
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.24,
        shadowRadius: 24,
        elevation: 5,
      },
    }),
  },
  secondary: {
    backgroundColor: "#FFF0D4",
    borderColor: "#E0B978",
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.68,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0,
  },
  primaryLabel: {
    color: "#FFF7EA",
  },
  secondaryLabel: {
    color: "#5A301C",
  },
});
