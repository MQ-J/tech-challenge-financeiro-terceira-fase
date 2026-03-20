import { TransactionForm } from '@/components/TransactionForm';
import TransactionsList from '@/components/TransactionsList';
import type { Transaction } from '@/lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransactionsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const isFocused = useIsFocused();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const enterAnimation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!isFocused) {
      enterAnimation.current?.stop();
      return;
    }

    enterAnimation.current?.stop();
    opacity.setValue(0);
    translateY.setValue(16);

    const anim = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]);
    enterAnimation.current = anim;
    anim.start();

    return () => {
      anim.stop();
    };
  }, [isFocused, opacity, translateY]);

  const openAdd = () => {
    setEditingTransaction(null);
    setModalVisible(true);
  };

  const openEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingTransaction(null);
  };

  return (
    <SafeAreaView style={styles.safeRoot} edges={['top']}>
      <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
        <TransactionsList onEdit={openEdit} />
      </Animated.View>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#25292e" />
      </Pressable>

      {/* Add / Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
            </Text>
            <Pressable onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.modalBody}
            keyboardShouldPersistTaps="handled"
          >
            <TransactionForm
              transaction={editingTransaction ?? undefined}
              onSuccess={closeModal}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeRoot: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffd33d',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  modalSafe: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
});
