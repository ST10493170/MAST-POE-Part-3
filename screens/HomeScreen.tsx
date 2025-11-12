import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MenuItemCard from '../components/MenuItemCard';
import { loadMenu, saveMenu, loadDrafts, saveDrafts } from '../storage';
import { MenuItem, Course } from '../types';

const COURSES: Course[] = ['Starters', 'Mains', 'Desserts', 'Drinks'];

export default function HomeScreen({ navigation, route }: any) {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [drafts, setDrafts] = useState<MenuItem[]>([]);
  const [filter, setFilter] = useState<'All' | Course | null>(null);

  // Load data once when the screen mounts
  useEffect(() => {
    (async () => {
      const loadedMenu = await loadMenu();
      const loadedDrafts = await loadDrafts();
      setMenu(loadedMenu);
      setDrafts(loadedDrafts);
    })();
  }, []);

  // Handle new items from AddItemScreen
  useEffect(() => {
    const newItem: MenuItem | undefined = route.params?.newItem;
    const isDraft: boolean | undefined = route.params?.draft;

    if (newItem) {
      if (isDraft) {
        const updatedDrafts = [newItem, ...drafts];
        setDrafts(updatedDrafts);
        saveDrafts(updatedDrafts);
      } else {
        const updatedMenu = [newItem, ...menu];
        setMenu(updatedMenu);
        saveMenu(updatedMenu);
      }
      navigation.setParams({ newItem: undefined, draft: undefined }); // prevent duplicates
    }
  }, [route.params]);

  // Save menu automatically when it changes
  useEffect(() => {
    saveMenu(menu).catch(console.warn);
  }, [menu]);

  // Save drafts automatically when they change
  useEffect(() => {
    saveDrafts(drafts).catch(console.warn);
  }, [drafts]);

  // Remove menu item with confirmation
  function removeItem(id: string) {
    Alert.alert('Remove Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const updated = menu.filter(item => item.id !== id);
          setMenu(updated);
          saveMenu(updated);
        },
      },
    ]);
  }

  // Stats helpers
  const totalItems = () => menu.length;

  const averagePriceByCourse = (course?: Course) => {
    const list = course ? menu.filter(m => m.course === course) : menu;
    if (!list.length) return 0;
    return list.reduce((sum, i) => sum + i.price, 0) / list.length;
  };

  // Add all drafts to menu
  const addAllDraftsToMenu = () => {
    if (!drafts.length) {
      Alert.alert('No drafts found', 'There are no drafts to add.');
      return;
    }
    const updatedMenu = [...drafts, ...menu];
    setMenu(updatedMenu);
    setDrafts([]);
    saveMenu(updatedMenu);
    saveDrafts([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Christoffel’s Menu Manager</Text>

      {/* Statistics */}
      <View style={styles.statsBox}>
        <Text style={styles.stat}>Total items: {totalItems()}</Text>
        <Text style={styles.stat}>Average price: R {averagePriceByCourse().toFixed(2)}</Text>
        {COURSES.map(course => (
          <Text key={course} style={styles.statSmall}>
            {course} avg: R {averagePriceByCourse(course).toFixed(2)}
          </Text>
        ))}
      </View>

      {/* Action buttons */}
      <View style={styles.buttonsRow}>
        <Button title="Add Item" onPress={() => navigation.navigate('AddItem')} />
        <Button title="Filter by Course" onPress={() => navigation.navigate('Filter', { items: menu })} />
        <Button title="Add Drafts" onPress={addAllDraftsToMenu} />
      </View>

      {/* Menu List */}
      <Text style={styles.sectionTitle}>Prepared Menu</Text>
      <FlatList
        data={filter && filter !== 'All' ? menu.filter(m => m.course === filter) : menu}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MenuItemCard item={item} onRemove={removeItem} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No menu items yet. Add one!</Text>}
      />

      {/* Drafts Section */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Draft Items</Text>
      <FlatList
        data={drafts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MenuItemCard
            item={item}
            onRemove={(id) => {
              const updated = drafts.filter(d => d.id !== id);
              setDrafts(updated);
              saveDrafts(updated);
            }}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No drafts saved.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  h1: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  statsBox: { marginBottom: 12 },
  stat: { fontWeight: '700' },
  statSmall: { color: '#555' },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontWeight: '700', marginBottom: 8, fontSize: 16 },
  emptyText: { color: '#777', fontStyle: 'italic' },
});
