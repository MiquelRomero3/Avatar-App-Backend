import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';

export default function Register1() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sex, setSex] = useState<'M' | 'F' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (!name || !email || !password || !sex) {
      return Alert.alert('Error', 'Completa todos los campos');
    }
    router.push({
      pathname: './register2',
      params: { name, email, password, sex },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.title}>Registro</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.sexContainer}>
          <TouchableOpacity
            style={[styles.sexButton, sex === 'M' && styles.sexButtonActive]}
            onPress={() => setSex('M')}
          >
            <Text style={[styles.sexIcon, sex === 'M' && styles.sexIconActive]}>♂</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sexButton, sex === 'F' && styles.sexButtonActive]}
            onPress={() => setSex('F')}
          >
            <Text style={[styles.sexIcon, sex === 'F' && styles.sexIconActive]}>♀</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={loading}>
          <Text style={styles.nextButtonText}>{loading ? 'Cargando...' : 'Siguiente'}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 25, backgroundColor: '#FFF' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#6B46C1', marginBottom: 30 },
  input: { 
    width: '100%', 
    borderWidth: 1, 
    borderColor: '#D3D3D3', 
    borderRadius: 12, 
    padding: 14, 
    marginBottom: 15,
    backgroundColor: '#FAFAFA'
  },
  
  sexContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '60%', marginVertical: 20 },
  sexButton: { 
    flex: 1, 
    marginHorizontal: 5, 
    backgroundColor: '#FFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 15, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#9F7AEA',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  sexButtonActive: { backgroundColor: '#9F7AEA' },
  sexIcon: { fontSize: 24, color: '#9F7AEA' },
  sexIconActive: { color: '#FFF' },

  nextButton: { 
    width: '100%', 
    backgroundColor: '#9F7AEA', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  nextButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
});
