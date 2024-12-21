import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';


export default function TabTwoScreen() {
  
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
});
