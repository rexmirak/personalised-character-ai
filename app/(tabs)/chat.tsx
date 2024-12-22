import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Clipboard from 'expo-clipboard'; 
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '@/constants/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const ChatPage: React.FC = () => {
  const router = useRouter();
  const { characterName } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false); // State to track typing animation
  const flatListRef = useRef<FlatList>(null);
  const [longPressedMessage, setLongPressedMessage] = useState<Message | null>(null); // Track the selected message for the menu
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [editMode, setEditMode] = useState(false); // Tracks if the edit popup is open
  const [editText, setEditText] = useState(''); // Holds the text being edited


  // Long press handler
  const handleLongPress = (message: Message) => {
    setLongPressedMessage(message);
    setModalVisible(true); // Show the modal
  };

  // Delete message handler
  const deleteMessage = async (message: Message) => {
    try {
      console.log("Deleting message:", message); // Debug log for the payload
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('User not authenticated');
      if (!characterName) throw new Error('Character name is missing');

      await axios.post(
        `${API_URL}/deleteMessage`,
        { "character_name": characterName, "message":message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setMessages((prevMessages) =>
        prevMessages.filter(
          (msg) => !(msg.role === message.role && msg.content === message.content)
        )
      );
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Copy message handler
  const copyMessage = async (message: Message) => {
    await Clipboard.setStringAsync(message.content);
    Alert.alert('Copied', 'Message copied to clipboard');
  };

  // Fetch chat messages from the backend
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) throw new Error('User not authenticated');
        if (!characterName) throw new Error('Character name is missing');

        const response = await axios.get(`${API_URL}/getChat`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { character_name: characterName },
        });

        const filteredMessages = response.data.messages.filter((msg: any) => msg.role !== 'system');

        setMessages(
          filteredMessages.length > 0
            ? filteredMessages.map((msg: any, idx: number) => ({
                id: idx.toString(),
                ...msg,
              }))
            : [
                {
                  id: 'default',
                  role: 'assistant',
                  content: `Start talking to ${characterName}`,
                },
              ]
        );
      } catch (error) {
        console.error('Error fetching chat:', error);
        setMessages([
          {
            id: 'default',
            role: 'assistant',
            content: `Start talking to ${characterName}`,
          },
        ]);
      }
    };

    fetchChat();
  }, [characterName]);
    // Edit message handler
    const editMessage = async () => {
      if (!longPressedMessage || editText.trim() === '') return;
  
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) throw new Error('User not authenticated');
        if (!characterName) throw new Error('Character name is missing');
  
        await axios.post(
          `${API_URL}/editMessage`,
          { character_name: characterName, old_message: longPressedMessage, new_content: editText },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
  
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === longPressedMessage.id ? { ...msg, content: editText } : msg
          )
        );
  
        setEditMode(false);
        setEditText('');
        setLongPressedMessage(null);
      } catch (error) {
        console.error('Error editing message:', error);
      }
    };
  
  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;

    const newMessage: Message = { id: Date.now().toString(), role: 'user', content: inputText };

    // Optimistically update UI
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    setInputText(''); // Clear input
    setIsTyping(true); // Start typing animation

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('User not authenticated');
      if (!characterName) throw new Error('Character name is missing');

      const response = await axios.post(
        `${API_URL}/sendMessage`,
        { character_name: characterName, message: inputText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const llmReply: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.data.message,
      };

      // Append the assistant's reply to the messages
      setMessages((prevMessages) => [...prevMessages, llmReply]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false); // Stop typing animation
    }
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableWithoutFeedback onLongPress={() => handleLongPress(item)}>
      <View
        style={[
          styles.messageBubble,
          item.role === 'user' ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.content}</Text>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 10}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={30} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {characterName || 'Chat'}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContainer}
        ListFooterComponent={
          isTyping ? (
            <View style={[styles.messageBubble, styles.assistantMessage]}>
              <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.typingText}>{characterName} is typing...</Text>
            </View>
          ) : null
        }
      />

      {/* Input Field */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#aaa"
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for long press menu */}
      {modalVisible && longPressedMessage && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalMenu}>
                <TouchableOpacity
                  style={styles.menuOption}
                  onPress={() => {
                    setEditMode(true);
                    setEditText(longPressedMessage.content);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.menuText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuOption}
                  onPress={() => {
                    deleteMessage(longPressedMessage);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.menuText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuOption}
                  onPress={() => {
                    copyMessage(longPressedMessage);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.menuText}>Copy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* Modal for editing message */}
      {editMode && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={editMode}
          onRequestClose={() => setEditMode(false)}
        >
          <TouchableWithoutFeedback onPress={() => setEditMode(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.editModal}>
                <TextInput
                  style={styles.editModalTextInput} // Use the dedicated style for the edit modal                  
                  value={editText}
                  onChangeText={setEditText}
                  placeholder="Edit message..."
                  placeholderTextColor="#555"
                />
                <TouchableOpacity onPress={editMessage} style={styles.editButton}>
                  <Text style={styles.sendButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: '#2C2C2C',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    height: 70,
  },
  backButton: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 3,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
  chatContainer: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingBottom: 10,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#444',
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    color: '#FFF',
    fontSize: 16,
  },
  typingText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#444',
    backgroundColor: '#2C2C2C',
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 15,
    color: '#FFF',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMenu: {
    backgroundColor: '#D3D3D3',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  menuOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#aaa',
  },
  menuText: {
    fontSize: 18,
    color: '#000',
  },
  editModal: {
    width: '90%',
    maxHeight: '66%',
    backgroundColor: '#D3D3D3',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },  
  editButton: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  editModalTextInput: {
    width: '100%',
    height: 40,
    backgroundColor: '#F0F0F0', // Light grey background for better contrast
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#000', // Black text color for visibility
    fontSize: 16,
    marginBottom: 10, // Spacing between the input and the button
    borderWidth: 1,
    borderColor: '#CCC', // Subtle border for clarity
  },
});

export default ChatPage;
