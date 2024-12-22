import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';


export default function TabTwoScreen() {
  const [persona, setPersona] = useState('');
  const handleImportChats = async () => {
    try {
      // Use DocumentPicker to select a file
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
  
      // Check if the user canceled the action
      if (result.canceled) {
        return; // User canceled the action
      }
  
      // Ensure the file is a JSON file
      if (!result.assets || !result.assets[0].name?.endsWith('.json')) {
        Alert.alert('Invalid File', 'Please select a valid .json file.');
        return;
      }
  
      // Define the destination path for chats.json
      const destinationPath = FileSystem.documentDirectory + 'backend/database/chats.json';
  
      // Warn if the file name isn't chats.json
      if (result.assets[0].name !== 'chats.json') {
        Alert.alert(
          'Warning',
          'The file is not named chats.json. It will be renamed automatically.'
        );
      }
  
      // Move and rename the file to replace existing chats.json
      await FileSystem.copyAsync({
        from: result.assets[0].uri!,
        to: destinationPath,
      });
  
      Alert.alert('Success', 'Chats imported successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to import chats.');
      console.error(error);
    }
  };
    

  const handleExportChats = async () => {
    try {
      const chatsPath = FileSystem.documentDirectory + 'chats.json';
      const backendChatsPath = FileSystem.documentDirectory + 'backend/database/chats.json'; // Replace with actual backend path if necessary

      // Check if chats.json exists
      const fileExists = await FileSystem.getInfoAsync(backendChatsPath);
      if (!fileExists.exists) {
        Alert.alert('Error', 'No chats file found to export.');
        return;
      }

      // Copy the file to make it available for download
      await FileSystem.copyAsync({
        from: backendChatsPath,
        to: chatsPath,
      });

      Alert.alert('Success', 'Chats exported successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to export chats.');
      console.error(error);
    }
  };

  useEffect(() => {
    // Load the persona from AsyncStorage on mount
    const loadPersona = async () => {
      const savedPersona = await AsyncStorage.getItem('userPersona');
      if (savedPersona) setPersona(savedPersona);
    };
    loadPersona();
  }, []);

  const handleSavePersona = async () => {
    try {
      await AsyncStorage.setItem('userPersona', persona);
      Alert.alert('Success', 'Persona saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save persona.');
      console.error(error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="gear"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>
      <View style={styles.container}>
        <Text style={styles.label}>Set Your Persona:</Text>
        <TextInput
          style={styles.input}
          value={persona}
          onChangeText={setPersona}
          placeholder="E.g., John is a creative writer"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSavePersona}>
          <Text style={styles.saveButtonText}>Save Persona</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        {/* Export Chats Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleExportChats}>
          <Text style={styles.buttonText}>Export All Your Chats</Text>
        </TouchableOpacity>

        {/* Import Chats Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleImportChats}>
          <Text style={styles.buttonText}>Import Chats</Text>
        </TouchableOpacity>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#808080', // Light blue color
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30, // Rounded corners
    marginVertical: 10,
    width: '80%', // Button width
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

