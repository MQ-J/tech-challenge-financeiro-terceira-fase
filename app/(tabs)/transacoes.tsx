import React, { useEffect, useRef } from 'react';
import { TextInputField } from '@/components/TextInputField';
import TransactionsList from '@/components/TransactionsList';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { StyleSheet, View, Animated } from 'react-native';
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

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
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
    ]).start();
  }, [opacity, translateY]);

  return (
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
      <TransactionsList filtro={watch('filtro')}/>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
