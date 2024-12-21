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
} from 'react-native';
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
    <View
      style={[
        styles.messageBubble,
        item.role === 'user' ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
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
});

export default ChatPage;
