import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UndoSnackbarProps {
  visible: boolean;
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export const UndoSnackbar: React.FC<UndoSnackbarProps> = ({
  visible,
  message,
  onUndo,
  onDismiss,
}) => {
  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: '#0F172A' }]}>
      <View style={styles.left}>
        <Ionicons name="checkmark-circle" size={20} color="#00D2EE" />
        <Text style={styles.message}>{message}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.undoBtn} onPress={onUndo} activeOpacity={0.7}>
          <Text style={styles.undoText}>UNDO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} onPress={onDismiss} activeOpacity={0.7}>
          <Ionicons name="close" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 100,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  message: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  undoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 210, 238, 0.15)',
    marginRight: 8,
  },
  undoText: {
    color: '#00D2EE',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
});
