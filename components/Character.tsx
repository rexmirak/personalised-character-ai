// app/components/Character.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CharacterProps {
  name: string;
}

const Character: React.FC<CharacterProps> = ({ name }) => {
  return (
    <View style={styles.characterContainer}>
      <Text style={styles.characterText}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  characterContainer: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  characterText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
});

export default Character;
