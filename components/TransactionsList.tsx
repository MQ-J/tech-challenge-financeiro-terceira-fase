import { FlatList, StyleSheet, Text, View } from 'react-native';

const transactions = [
  {
    id: '1',
    type: 'deposito',
    amount: 50.0,
    date: '2022-11-21',
    description: 'Depósito em conta',
  },
  {
    id: '2',
    type: 'saque',
    amount: -100.0,
    date: '2022-11-24',
    description: 'Saque em caixa eletrônico',
  },
  {
    id: '3',
    type: 'transferencia',
    amount: -500.0,
    date: '2022-11-21',
    description: 'Transferência enviada',
  },
  {
    id: '4',
    type: 'pagamento',
    amount: -250.0,
    date: '2022-11-22',
    description: 'Pagamento de conta',
  },
  {
    id: '5',
    type: 'deposito',
    amount: 300.0,
    date: '2022-11-25',
    description: 'Depósito via PIX',
  },
  {
    id: '6',
    type: 'saque',
    amount: -80.0,
    date: '2022-11-26',
    description: 'Saque em caixa eletrônico',
  },
  {
    id: '7',
    type: 'transferencia',
    amount: -150.0,
    date: '2022-11-27',
    description: 'Transferência para amigo',
  },
  {
    id: '8',
    type: 'pagamento',
    amount: -120.0,
    date: '2022-11-28',
    description: 'Pagamento de fatura',
  },
]

interface TransactionsListProps {
  filtro: string
}

export default function TransactionsList({filtro}: TransactionsListProps) {

  const filteredTransactions = !filtro ? transactions : transactions.filter(t => t.amount.toString().includes(filtro) ||
   t.description.toLowerCase().includes(filtro.toLowerCase()) ||
   new Date(t.date).toLocaleDateString().includes(filtro)
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredTransactions}
        renderItem={({item}) => (
          <View key={item.id} style={styles.item}>
            <View>
              <Text style={styles.description}>{item.description}</Text>

              <Text style={styles.date}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.right}>
              <Text
                style={[
                  styles.amount,
                  item.type === 'deposito' ? styles.income : styles.expense
                ]}
              >
                {item.type === 'deposito' ? "+" : "-"}R$ {item.amount.toFixed(2)}
              </Text>
            </View>
         </View>
        )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 5,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  description: {
    color: "#999",
    fontWeight: "500",
    fontSize: 16,
  },

  date: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
  },

  amount: {
    fontWeight: "600",
    marginRight: 8,
  },

  income: {
    color: "#16a34a",
  },

  expense: {
    color: "#dc2626",
  },

  deleteButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  deleteText: {
    fontSize: 12,
  },
});
