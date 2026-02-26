// app/measures.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../providers/auth-provider';
import axiosInstance from '../utils/axiosInstance';

const { width, height } = Dimensions.get('window');

export default function Measures() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [heightValue, setHeightValue] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setHeightValue(user.height?.toString() || '');
      setChest(user.chest?.toString() || '');
      setWaist(user.waist?.toString() || '');
      setHips(user.hips?.toString() || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!heightValue || !chest || !waist || !hips) {
      return Alert.alert('Error', 'Completa totes les mesures');
    }

    setLoading(true);

    try {
      // Crida PATCH al backend
      const res = await axiosInstance.patch('/users/me/measures', {
        height: Number(heightValue),
        chest: Number(chest),
        waist: Number(waist),
        hips: Number(hips),
      });

      // Actualitzem context
      setUser((prev: any) => ({
        ...prev,
        height: Number(heightValue),
        chest: Number(chest),
        waist: Number(waist),
        hips: Number(hips),
      }));

      Alert.alert('Èxit', 'Mesures actualitzades correctament');
      router.back();
    } catch (err: any) {
      console.log(err);
      Alert.alert('Error', err.response?.data?.message || 'No s’han pogut actualitzar les mesures');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Talles corporals',
          headerStyle: {
            backgroundColor: '#F7F3FF',
          },
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '600',
            marginTop: 40, // baixa el títol respecta la barra de sistema
          },
          headerTintColor: '#6B46C1',
          headerTitleAlign: 'center',
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Altura (cm)</Text>
              <TextInput
                style={styles.input}
                value={heightValue}
                onChangeText={setHeightValue}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Pit (cm)</Text>
              <TextInput
                style={styles.input}
                value={chest}
                onChangeText={setChest}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Cintura (cm)</Text>
              <TextInput
                style={styles.input}
                value={waist}
                onChangeText={setWaist}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Malucs (cm)</Text>
              <TextInput
                style={styles.input}
                value={hips}
                onChangeText={setHips}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <Text style={styles.hint}>
          Aquestes dades s’utilitzen per millorar l’experiència de Try-On
        </Text>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Guardant...' : 'Guardar canvis'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 25,
    backgroundColor: '#F7F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    marginHorizontal: 10,
  },
  button: {
    width: '100%',
    backgroundColor: '#9F7AEA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
