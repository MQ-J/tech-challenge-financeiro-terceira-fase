import React, { useEffect, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { TextInputField } from '@/components/TextInputField';
import TransactionsList from '@/components/TransactionsList';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { StyleSheet, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import z from 'zod';

const filtroSchema = z.object({
  filtro: z.string(),
})

type LoginFormValues = z.infer<typeof filtroSchema>

export default function TransactionsScreen() {

  const {
    control,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(filtroSchema),
  })

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

  return (
    <SafeAreaView style={styles.safeRoot} edges={['top']}>
      <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
        <View style={styles.filterContainer}>
          <TextInputField
            name="filtro"
            control={control}
            autoCapitalize="none"
            icon="search"
            error={errors.filtro}
            placeholder="Digite sua busca"
          />
        </View>
        <TransactionsList filtro={watch('filtro')} />
      </Animated.View>
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
  filterContainer: {
    height: 80,
    marginHorizontal: 16,
  },
  text: {
    color: '#fff',
  },
});
