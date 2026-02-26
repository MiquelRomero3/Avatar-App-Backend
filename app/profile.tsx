// app/profile.tsx
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../providers/auth-provider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export default function Profile() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileImage(user.profilePhotoUrl ?? null);
      setUsername(user.name ?? '');
      setTempUsername(user.name ?? '');
    }
  }, [user]);

  const AVATAR_SIZE = width * 0.35;

  /* ================= USERNAME ================= */

  const saveUsername = async () => {
    if (!tempUsername.trim()) {
      return Alert.alert('Error', 'El username no pot estar buit');
    }

    try {
      const res = await axiosInstance.patch('/users/me/username', {
        name: tempUsername.trim(),
      });

      setUsername(tempUsername.trim());
      setIsEditing(false);

      setUser((prev: any) => ({
        ...prev,
        name: tempUsername.trim(),
      }));
    } catch (err) {
      Alert.alert('Error', 'No s’ha pogut actualitzar el username');
    }
  };

  /* ================= IMAGE ================= */

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permís necessari', 'Cal accés a la galeria.');
      return false;
    }
    return true;
  };

  const pickImage = async (): Promise<string | null> => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  };

  const uploadToCloudinary = async (uri: string): Promise<string> => {
    const formData = new FormData();

    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    if (!data.secure_url) throw new Error('Upload failed');

    return data.secure_url;
  };

  const changeProfilePhoto = async () => {
    try {
      const localUri = await pickImage();
      if (!localUri) return;

      const cloudUrl = await uploadToCloudinary(localUri);

      await axiosInstance.patch('/users/me/profile-photo', {
        profilePhotoUrl: cloudUrl,
      });

      setProfileImage(cloudUrl);
      setUser((prev: any) => ({ ...prev, profilePhotoUrl: cloudUrl }));
    } catch (error) {
      Alert.alert('Error', 'No s’ha pogut actualitzar la foto');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.wrapper}>
          <View>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={28} color="#6B46C1" />
              </TouchableOpacity>

              <Image source={require('../assets/images/wavy.png')} style={styles.wavy} />
            </View>

            <View style={styles.avatarContainer}>
              <View style={[styles.avatarWrapper, { width: AVATAR_SIZE, height: AVATAR_SIZE }]}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatar} />
                ) : (
                  <Text style={{ fontSize: 50 }}>👤</Text>
                )}

                <TouchableOpacity style={styles.editIcon} onPress={changeProfilePhoto}>
                  <Ionicons name="pencil" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* USERNAME */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {isEditing ? (
                  <TextInput
                    value={tempUsername}
                    onChangeText={setTempUsername}
                    autoFocus
                    style={styles.username}
                  />
                ) : (
                  <Text style={styles.username}>{username || 'Username'}</Text>
                )}

                <TouchableOpacity
                  onPress={isEditing ? saveUsername : () => setIsEditing(true)}
                  style={{ marginLeft: 8 }}
                >
                  <Ionicons
                    name={isEditing ? 'checkmark' : 'pencil'}
                    size={20}
                    color="#6B46C1"
                  />
                </TouchableOpacity>

                {isEditing && (
                  <TouchableOpacity
                    onPress={() => {
                      setTempUsername(username);
                      setIsEditing(false);
                    }}
                    style={{ marginLeft: 6 }}
                  >
                    <Ionicons name="close" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.list}>
              <Item icon="person-outline" text="My Profile" />
               <Item icon="body-outline" text="Talles" onPress={() => router.push('./measures')} />
              <Item icon="settings-outline" text="Settings" />
            </View>
          </View>

          <TouchableOpacity
            style={styles.logout}
            onPress={async () => {
              await AsyncStorage.removeItem('token');
              router.replace('/login');
            }}
          >
            <Ionicons name="log-out-outline" size={22} color="#999" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

function Item({ icon, text, onPress }: { icon: any; text: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#999" />
      <Text style={styles.itemText}>{text}</Text>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  wrapper: { flex: 1, minHeight: height, justifyContent: 'space-between' },
  header: { height: height * 0.28, backgroundColor: '#F7F3FF' },
  wavy: { position: 'absolute', bottom: 0, width, height: height * 0.22, resizeMode: 'cover' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  avatarContainer: { alignItems: 'center', marginTop: -width * 0.18 },
  avatarWrapper: {
    borderRadius: 999,
    backgroundColor: '#CBB6F9',
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: { width: '100%', height: '100%', borderRadius: 999 },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#6B46C1',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: { marginTop: 15, fontSize: 20, fontWeight: '600', color: '#333' },
  list: { paddingHorizontal: 20, marginTop: 25 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  itemText: { marginLeft: 15, fontSize: 16, color: '#333' },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 25 },
  logoutText: { marginLeft: 8, fontSize: 16, color: '#999' },
});
