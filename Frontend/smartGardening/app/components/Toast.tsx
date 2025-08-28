import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Dimensions } from 'react-native';

interface ToastProps {
  visible: boolean;
  message: string;
  onHide: () => void;
  duration?: number; // in ms
}

const { width } = Dimensions.get('window');

const Toast: React.FC<ToastProps> = ({ visible, message, onHide, duration = 2000 }) => {
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.timing(slideAnim, {
        toValue: 40,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // Auto-hide after duration
      timerRef.current = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -80,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onHide());
      }, duration);
    } else {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: -80,
        duration: 300,
        useNativeDriver: true,
      }).start();
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY: slideAnim }] }]}> 
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 0,
    left: width * 0.1,
    width: width * 0.8,
    backgroundColor: '#388e3c',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    zIndex: 9999,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Toast;
