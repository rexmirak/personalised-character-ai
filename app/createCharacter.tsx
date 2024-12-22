import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@/constants/api';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

const CreateCharacter = () => {
  const [name, setName] = useState('');
  const [background, setBackground] = useState('');
  const [physicalTraits, setPhysicalTraits] = useState('');
  const [mannerisms, setMannerisms] = useState('');
  const [knownConnections, setKnownConnections] = useState('');
  const [other, setOther] = useState('');
  const [persona, setPersona] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [avatarUri, setAvatarUri] = useState<string>('/assets/images/avatar.png'); // Default to the string type

  const router = useRouter();
  const navigation = useNavigation();
  // Fetch persona from AsyncStorage
  useEffect(() => {
    const fetchPersona = async () => {
      try {
        const storedPersona = await AsyncStorage.getItem('userPersona');
        setPersona(storedPersona || ''); // Default to an empty string if no persona is found
      } catch (error) {
        console.error('Error fetching persona:', error);
      } finally {
        setIsLoading(false); // Mark loading as complete
      }
    };

    fetchPersona();
  }, []);
    // Set header title dynamically
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Create Character', // Update the header title
      headerTitleAlign: 'center', // Center the title
    });
  }, [navigation]);

  // Function to upload avatar
  const uploadAvatar = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
      });
  
      // Check if the result has the required properties
      if ('uri' in result && 'name' in result && result.uri && result.name) {
        const uri = result.uri as string; // Ensure 'uri' is a string
        const name = result.name as string; // Explicitly cast 'name' to a string
  
        const fileExtension = name.split('.').pop(); // Extract file extension
        const newAvatarPath = `${FileSystem.documentDirectory}assets/images/${name}.${fileExtension}`;
  
        // Ensure the directory exists
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'assets/images', { intermediates: true });
  
        // Move the selected file to the assets/images directory
        await FileSystem.copyAsync({
          from: uri,
          to: newAvatarPath,
        });
  
        setAvatarUri(newAvatarPath); // Update the avatar URI state
      } else {
        console.log('DocumentPicker canceled or returned an invalid result');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload avatar. Please try again.');
    }
  };
  
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
          persona: persona || '', // Pass persona
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
    if (name && background && physicalTraits && mannerisms && knownConnections && other) {
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
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false} // Optional: Hides the scrollbar
        >          
        <Text style={styles.title}>Create Character</Text>
          {/* Avatar Section */}
          <TouchableOpacity onPress={uploadAvatar}>
            <Image source={require('@/assets/images/avatar.png')} style={styles.avatar} />
          </TouchableOpacity>
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
          <TextInput
            style={styles.inputLong}
            placeholder="other"
            placeholderTextColor="#aaa"
            value={other}
            onChangeText={setOther}
            multiline
          />
          {/* Add margin to ensure button is visible */}
          <View style={styles.buttonContainer}>
            <Button title="Create Character" onPress={handleCreate} />
          </View>
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
  avatar: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 16 },
  gradientContainer: {
    flex: 1,
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
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 50,
    paddingBottom: 50, // Add padding to prevent the button from being hidden
  },
  buttonContainer: {
    marginTop: 16, // Add spacing above the button
  },
});

export default CreateCharacter;
