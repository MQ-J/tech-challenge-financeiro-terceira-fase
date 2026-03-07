import FlatListBasics from '@/components/FlatListBasics';
import { StyleSheet, Text, View } from 'react-native';

export default function TransactionsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.text}>Listar e criar transações</Text>
      </View>
      <FlatListBasics/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  textContainer: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
});
