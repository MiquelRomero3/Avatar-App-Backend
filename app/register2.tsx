import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import axios from '../utils/axiosInstance';
import Constants from 'expo-constants';
import { useAuth } from '../providers/auth-provider';

const CLOUDINARY_CLOUD_NAME =
  Constants.manifest?.extra?.CLOUDINARY_CLOUD_NAME || 'dof7txmg3';
const CLOUDINARY_UPLOAD_PRESET =
  Constants.manifest?.extra?.CLOUDINARY_UPLOAD_PRESET || 'avatar_upload';

export default function Register2() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { name, email, password, sex } = params;

  const { login } = useAuth(); // 👈 clau

  const [height, setHeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!imageUri) return null;

    const formData = new FormData();
    formData.append(
      'file',
      { uri: imageUri, type: 'image/jpeg', name: 'tryon.jpg' } as any
    );
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    const data = await res.json();
    return data.secure_url;
  };

  const handleRegister = async () => {
    if (!height || !chest || !waist || !hips) {
      return Alert.alert('Error', 'Completa todos los campos');
    }

    setLoading(true);

    try {
      let tryOnUrl = null;
      if (imageUri) {
        tryOnUrl = await uploadImage();
      }

      // 1️⃣ Registrar usuari
      await axios.post('/users/register', {
        name,
        email,
        password,
        sex,
        height: Number(height),
        chest: Number(chest),
        waist: Number(waist),
        hips: Number(hips),
        tryOnPhotoUrl: tryOnUrl,
      });

      // 2️⃣ Login automàtic
      await login(String(email), String(password));

      // 3️⃣ Entrar directament a l'app
      router.replace('./(tabs)/inventory');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Registro - TryOn & Medidas</Text>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.imageText}>Selecciona imagen TryOn</Text>
          )}
        </TouchableOpacity>

        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            placeholder="Altura (cm)"
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
          />
          <TextInput
            style={[styles.input, { flex: 1, marginLeft: 8 }]}
            placeholder="Pecho (cm)"
            keyboardType="numeric"
            value={chest}
            onChangeText={setChest}
          />
        </View>

        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            placeholder="Cintura (cm)"
            keyboardType="numeric"
            value={waist}
            onChangeText={setWaist}
          />
          <TextInput
            style={[styles.input, { flex: 1, marginLeft: 8 }]}
            placeholder="Caderas (cm)"
            keyboardType="numeric"
            value={hips}
            onChangeText={setHips}
          />
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>
            {loading ? 'Cargando...' : 'Registrarse'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B46C1',
    marginBottom: 25,
    textAlign: 'center',
  },
  imagePicker: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  imageText: { color: '#6B46C1', fontWeight: 'bold', fontSize: 16 },
  image: { width: '100%', height: '100%', borderRadius: 12 },
  row: { flexDirection: 'row', width: '100%', marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FAFAFA',
  },
  registerButton: {
    width: '100%',
    backgroundColor: '#9F7AEA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
});
