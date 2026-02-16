import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';
import { BORDER_RADIUS } from '../../constants/spacing';

interface AvatarProps {
  uri?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
}

const Avatar: React.FC<AvatarProps> = ({ uri, size = 'md', style }) => {
  const sizeValue = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  }[size];

  return (
    <View
      style={[
        styles.container,
        { width: sizeValue, height: sizeValue, borderRadius: sizeValue / 2 },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: sizeValue, height: sizeValue, borderRadius: sizeValue / 2 }]}
        />
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.gray200,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    backgroundColor: COLORS.gray300,
  },
});

export default Avatar;
