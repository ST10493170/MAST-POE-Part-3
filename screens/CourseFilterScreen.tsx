import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, Alert } from 'react-native';
import MenuItemCard from '../components/MenuItemCard';
import { MenuItem, Course } from '../types';
import { loadMenu, saveMenu } from '../storage';

interface Props {
  route?: {
    params?: {
      course?: Course;
    };
  };
}

export default function CourseFilterScreen({ route }: Props) {
  const courseFilter: Course = route?.params?.course ?? 'Starters';
  const [items, setItems] = useState<MenuItem[]>([]);

  // Load menu items from AsyncStorage on mount
  useEffect(() => {
    async function fetchMenu() {
      const allItems = await loadMenu();
      const filtered = allItems.filter(item => item.course === courseFilter);
      setItems(filtered);
    }
    fetchMenu();
  }, [courseFilter]);

  // Remove item
  const handleRemove = async (id: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            const updated = items.filter(item => item.id !== id);
            setItems(updated);
            const allItems = await loadMenu();
            const newAllItems = allItems.filter(item => item.id !== id);
            await saveMenu(newAllItems);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <Text style={styles.empty}>No items in {courseFilter}</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MenuItemCard item={item} onRemove={handleRemove} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f4f4' },
  empty: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#555' },
});
