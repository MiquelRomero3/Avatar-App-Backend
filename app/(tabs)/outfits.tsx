import { View, Text, StyleSheet } from 'react-native';

export default function Outfits() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Outfits</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#6B46C1' },
});
