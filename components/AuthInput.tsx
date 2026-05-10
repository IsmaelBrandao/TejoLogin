import { ReactNode, useRef, useState } from "react";
import {
  Animated,
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
    outputRange: [error ? "#CC5B4F" : "#D8D2C7", "#0F5E53"],
  });

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View
        style={[
          styles.inputShell,
          {
            borderColor,
            backgroundColor: focused ? "#FFFFFF" : "#FDFBF7",
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
          placeholderTextColor="#817A70"
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
              <Eye size={20} color="#566158" />
            ) : (
              <EyeOff size={20} color="#566158" />
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
    color: "#24312C",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0,
  },
  inputShell: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 58,
    paddingHorizontal: 16,
  },
  iconSlot: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    marginRight: 12,
    width: 24,
  },
  input: {
    color: "#17211D",
    flex: 1,
    fontSize: 16,
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
