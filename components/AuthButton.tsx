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
          <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : "#11342F"} />
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
    borderRadius: 18,
  },
  button: {
    alignItems: "center",
    borderRadius: 18,
    minHeight: 58,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: "#0F5E53",
    ...Platform.select({
      web: {
        boxShadow: "0 16px 24px rgba(15, 94, 83, 0.24)",
      },
      default: {
        shadowColor: "#0F5E53",
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.24,
        shadowRadius: 24,
        elevation: 5,
      },
    }),
  },
  secondary: {
    backgroundColor: "#E8EFE8",
    borderColor: "#BFD2C7",
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
    fontWeight: "800",
    letterSpacing: 0,
  },
  primaryLabel: {
    color: "#FFFFFF",
  },
  secondaryLabel: {
    color: "#11342F",
  },
});
