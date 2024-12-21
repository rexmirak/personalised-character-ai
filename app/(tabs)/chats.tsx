import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { API_URL } from '@/constants/api';
import { LinearGradient } from 'expo-linear-gradient';

const Chats = () => {
  const [characters, setCharacters] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const response = await axios.post(
            `${API_URL}/chats`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const chatData = response.data.chat;
          console.log(response.data.chat);
          const characterNames = Object.keys(chatData).filter((key) => !key.startsWith('user'));
          setCharacters(characterNames.map((name) => ({ name })));
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  return (
    <LinearGradient
      colors={['#0F2027', '#203A43', '#2C5364']} // Modern dark gradient colors
      style={styles.gradientContainer}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Your Characters</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#25D366" />
        ) : (
          <FlatList
            data={characters}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.character}
                onPress={() => router.push({ pathname: '/chat', params: { characterName: item.name } })}
              >
                <Image
                  source={{ uri: 'https://via.placeholder.com/50' }} // Replace with real avatars
                  style={styles.avatar}
                />
                <Text style={styles.characterName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            ListFooterComponent={
              <TouchableOpacity
                style={styles.addNewButton}
                onPress={() => router.push('/createCharacter')}
              >
                <Image
                  source={{ uri: 'https://via.placeholder.com/50' }} // Replace with a "+" icon
                  style={styles.avatar}
                />
                <Text style={styles.addNewText}>Add New</Text>
              </TouchableOpacity>
            }
          />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff',
    alignSelf: 'center',
  },
  character: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  characterName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 200, 0, 0.1)',
    borderRadius: 12,
    marginTop: 12,
  },
  addNewText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
  },
});

export default Chats;
