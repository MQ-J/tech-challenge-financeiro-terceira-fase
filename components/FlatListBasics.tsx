import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function FlatListBasics() {
return (
    <View style={styles.container}>
      <FlatList
        data={[
            { key: 'R$ 50,00' },
            { key: 'R$ -20,40' },
            { key: 'R$ -10,00' },
            { key: 'R$ 120,35' },
            { key: 'R$ -5,90' },
            { key: 'R$ 300,00' },
            { key: 'R$ 42,15' },
            { key: 'R$ -89,99' },
            { key: 'R$ 15,00' },
            { key: 'R$ 9,50' },
            { key: 'R$ -120,00' },
            { key: 'R$ 78,30' },
            { key: 'R$ 250,00' },
            { key: 'R$ -33,70' },
            { key: 'R$ 60,00' }
        ]}
        renderItem={({item}) => <Text style={styles.item}>{item.key}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
     color: '#fff',
  },
});
