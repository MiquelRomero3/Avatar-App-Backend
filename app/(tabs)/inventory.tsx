// app/tabs/inventory.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../providers/auth-provider';
import axiosInstance from '../../utils/axiosInstance';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2; // 2 cards per row amb margin
const HEADER_HEIGHT = height * 0.12; // alçada estimada de la zona del header amb la foto de perfil

type InventoryItem = {
  id: number;
  size?: string;
  product: {
    id: number;
    name: string;
    imageUrl?: string;
    category?: string;
    brand?: string;
  };
};

export default function InventoryScreen() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get<InventoryItem[]>('/inventory');
      setInventory(res.data);
    } catch (err: any) {
      console.log('Error fetching inventory:', err);
      Alert.alert('Error', 'No s’ha pogut carregar l’inventari');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const removeProduct = async (productId: number) => {
    try {
      await axiosInstance.delete(`/inventory/${productId}`);
      setInventory(prev => prev.filter(item => item.product.id !== productId));
    } catch (err: any) {
      console.log('Error removing product:', err);
      Alert.alert('Error', 'No s’ha pogut eliminar el producte');
    }
  };

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        {item.product.imageUrl ? (
          <Image
            source={{ uri: item.product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ color: '#FFF', fontSize: 24 }}>👕</Text>
          </View>
        )}
        {item.size && (
          <View style={styles.sizeBadge}>
            <Text style={styles.sizeBadgeText}>{item.size}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{item.product.name}</Text>
        <Text style={styles.category}>{item.product.category || item.product.brand || ''}</Text>
      </View>

      <TouchableOpacity
        style={styles.trashButton}
        onPress={() =>
          Alert.alert(
            'Eliminar',
            'Segur que vols eliminar aquest producte de l’inventari?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Eliminar', style: 'destructive', onPress: () => removeProduct(item.product.id) },
            ]
          )
        }
      >
        <Ionicons name="trash-outline" size={22} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* Títol Armario alineat verticalment amb la foto de perfil */}
        <View style={[styles.header, { height: HEADER_HEIGHT, paddingTop: height * 0.05 }]}>
  <Text style={styles.title}>Armario</Text>
</View>

        {inventory.length === 0 && !loading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>El teu inventari està buit 😅</Text>
          </View>
        ) : (
          <FlatList
            key="inventory-2cols"
            data={inventory}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 15 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshing={loading}
            onRefresh={fetchInventory}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
  },
  header: {
    justifyContent: 'center', // vertical centering
    marginBottom: 15,
  },
  title: {
    fontSize: width * 0.07, // font responsive
    fontWeight: '700',
    color: '#6B46C1',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    position: 'relative',
  },
  imageWrapper: {
    width: '100%',
    height: CARD_WIDTH,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#9F7AEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#6B46C1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sizeBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  info: {
    padding: 10,
  },
  name: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  category: { fontSize: 12, color: '#777', marginTop: 2 },
  trashButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#E53E3E',
    padding: 6,
    borderRadius: 12,
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, color: '#A0AEC0' },
});
