// app/tabs/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Image, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/auth-provider';
import { useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';

export default function TabsLayout() {
  const router = useRouter();
  const { user, setUser, loading } = useAuth();

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (user && !user.profilePhotoUrl) {
        try {
          const res = await axiosInstance.get('/users/me/profile-photo');
          const profileUrl = res.data.profilePhotoUrl || null;
          setUser((prev: any) => ({ ...prev, profilePhotoUrl: profileUrl }));
        } catch (err) {
          console.log('Error fetching profile photo for tabs:', err);
        }
      }
    };
    fetchProfilePhoto();
  }, [user]);

  if (loading) return null; // espera que context carregui

  const profileImage = user?.profilePhotoUrl || null;

  return (
    <>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => router.push('/profile')}
      >
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>👤</Text>
          </View>
        )}
      </TouchableOpacity>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#9F7AEA',
          tabBarInactiveTintColor: '#A0AEC0',
          tabBarStyle: { backgroundColor: '#FFF', height: 60 },
        }}
      >
        <Tabs.Screen
          name="inventory"
          options={{
            title: 'Inventari',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="albums-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="outfits"
          options={{
            title: 'Outfits',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="shirt-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Buscar',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tryon"
          options={{
            title: 'Try On',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="camera-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    position: 'absolute',
    top: 50,
    right: 15,
    zIndex: 10,
  },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  placeholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9F7AEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { color: '#FFF', fontSize: 20 },
});
