import { useEffect, useRef } from "react";
import { Animated, Keyboard, KeyboardEvent, Platform } from "react-native";

export function useKeyboardOffset() {
  const offset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent: any =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent: any =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const duration = Platform.OS === "ios" ? 250 : 200;

    const onShow = (e: KeyboardEvent) => {
      Animated.timing(offset, {
        toValue: e.endCoordinates.height,
        duration,
        useNativeDriver: false,
      }).start();
    };

    const onHide = () => {
      Animated.timing(offset, {
        toValue: 0,
        duration,
        useNativeDriver: false,
      }).start();
    };

    const subShow = Keyboard.addListener(showEvent, onShow);
    const subHide = Keyboard.addListener(hideEvent, onHide);

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [offset]);

  return offset;
}
