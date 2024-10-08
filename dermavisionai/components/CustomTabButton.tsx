import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/Colors';

const CustomTabButton = () => {
  const router = useRouter();

  const handlePress = () => {
    router.push('/camera');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.button}>
        <Icon name="camera-alt" size={24} color={Colors.light.background} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    top: -30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default CustomTabButton;