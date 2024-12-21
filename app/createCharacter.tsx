import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@/constants/api';

const CreateCharacter = () => {
  const [name, setName] = useState('');
  const [background, setBackground] = useState('');
  const [physicalTraits, setPhysicalTraits] = useState('');
  const [mannerisms, setMannerisms] = useState('');
  const [knownConnections, setKnownConnections] = useState('');

  const router = useRouter();
  const navigation = useNavigation();

  // Set header title dynamically
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Create Character', // Update the header title
      headerTitleAlign: 'center', // Center the title
    });
  }, [navigation]);

  // Function to create a new character
  const createCharacter = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await axios.post(
        `${API_URL}/createCharacter`,
        {
          name,
          background,
          physicalDescription: physicalTraits,
          mannerisms,
          knownconnections: knownConnections,
          other: 'Other details about the character',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating character:', error);
      throw error;
    }
  };

  // Handle form submission
  const handleCreate = async () => {
    if (name && background && physicalTraits && mannerisms && knownConnections) {
      try {
        const response = await createCharacter();
        Alert.alert('Success', response.message);
        router.push('/chats');
      } catch (error) {
        Alert.alert('Error', 'Failed to create character. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Please fill out all fields.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 10}
    >
      <LinearGradient
        colors={['#0F2027', '#203A43', '#2C5364']} // Modern dark gradient colors
        style={styles.gradientContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Create Character</Text>
          <TextInput
            style={styles.inputShort}
            placeholder="Name"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.inputLong}
            placeholder="Background"
            placeholderTextColor="#aaa"
            value={background}
            onChangeText={setBackground}
            multiline
          />
          <TextInput
            style={styles.inputLong}
            placeholder="Physical Traits"
            placeholderTextColor="#aaa"
            value={physicalTraits}
            onChangeText={setPhysicalTraits}
            multiline
          />
          <TextInput
            style={styles.inputLong}
            placeholder="Mannerisms"
            placeholderTextColor="#aaa"
            value={mannerisms}
            onChangeText={setMannerisms}
            multiline
          />
          <TextInput
            style={styles.inputLong}
            placeholder="Known Connections (e.g., Bob:Father, John:Brother)"
            placeholderTextColor="#aaa"
            value={knownConnections}
            onChangeText={setKnownConnections}
            multiline
          />
          <Button title="Create Character" onPress={handleCreate} />
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  gradientContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
    color: '#ffffff',
  },
  inputShort: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputLong: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 100, // Adjusted for longer input
    textAlignVertical: 'top',
  },
});

export default CreateCharacter;
