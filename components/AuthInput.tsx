import { ReactNode, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

type AuthInputProps = TextInputProps & {
  label: string;
  icon: ReactNode;
  error?: string;
  secureToggle?: boolean;
};

export function AuthInput({
  label,
  icon,
  error,
  secureTextEntry,
  secureToggle,
  onBlur,
  onFocus,
  style,
  ...props
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));
  const focusAnim = useRef(new Animated.Value(0)).current;

  function setFocus(nextFocused: boolean) {
    setFocused(nextFocused);
    Animated.timing(focusAnim, {
      toValue: nextFocused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? "#CC5B4F" : "#E0C6A2", "#A45D2B"],
  });

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View
        style={[
          styles.inputShell,
          {
            borderColor,
            backgroundColor: focused ? "#FFFDF7" : "#FFF8ED",
          },
        ]}
      >
        <View style={styles.iconSlot}>{icon}</View>
        <TextInput
          {...props}
          onBlur={(event) => {
            setFocus(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocus(true);
            onFocus?.(event);
          }}
          placeholderTextColor="#9A8372"
          secureTextEntry={hidden}
          style={[styles.input, style]}
        />
        {secureToggle ? (
          <Pressable
            accessibilityLabel={hidden ? "Mostrar senha" : "Ocultar senha"}
            onPress={() => setHidden((value) => !value)}
            style={styles.eyeButton}
          >
            {hidden ? (
              <Eye size={20} color="#6F5848" />
            ) : (
              <EyeOff size={20} color="#6F5848" />
            )}
          </Pressable>
        ) : null}
      </Animated.View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    color: "#3B2417",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
  },
  inputShell: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 60,
    paddingHorizontal: 14,
    ...Platform.select({
      web: {
        boxShadow: "0 10px 24px rgba(74, 36, 20, 0.05)",
      },
      default: {
        shadowColor: "#4A2414",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 1,
      },
    }),
  },
  iconSlot: {
    alignItems: "center",
    backgroundColor: "#F5E0BD",
    borderRadius: 12,
    height: 34,
    justifyContent: "center",
    marginRight: 12,
    width: 34,
  },
  input: {
    color: "#2A1D15",
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0,
    minWidth: 0,
    outlineStyle: "none" as never,
    paddingVertical: 14,
  },
  eyeButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    marginLeft: 8,
    width: 38,
  },
  error: {
    color: "#B9473D",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0,
  },
});
