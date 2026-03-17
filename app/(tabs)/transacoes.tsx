import { TextInputField } from '@/components/TextInputField';
import TransactionsList from '@/components/TransactionsList';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
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

  return (
    <View style={styles.container}>
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
    </View>
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
