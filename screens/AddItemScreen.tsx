import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { MI } from '../types'; // Make sure your MenuItem type is imported
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  CourseFilter: { items: MI[]; course: string };
  AddItem: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'AddItem'>;

export default function AddItemScreen({ navigation, route }: Props) {
  const [name, setName] = useState('');
  const [course, setCourse] = useState('Starters');
  const [price, setPrice] = useState('');

  const handleAddItem = () => {
    if (!name || !price) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const newItem: MI = {
      id: Date.now().toString(),
      name,
      course,
      price: parseFloat(price),
    };

    // Navigate back to CourseFilterScreen with the updated list
    navigation.navigate('CourseFilter', {
      items: [newItem], // You can later append to existing items if you store state elsewhere
      course,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Item Name:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter item name"
      />

      <Text style={styles.label}>Course:</Text>
      <TextInput
        style={styles.input}
        value={course}
        onChangeText={setCourse}
        placeholder="Starters, Main, Dessert..."
      />

      <Text style={styles.label}>Price:</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Enter price"
        keyboardType="numeric"
      />

      <Button title="Add Item" onPress={handleAddItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});
