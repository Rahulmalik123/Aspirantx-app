import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOW } from '../../constants/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
  shadow = true,
}) => {
  return (
    <View
      style={[
        styles.card,
        styles[`padding_${padding}`],
        shadow && SHADOW.md,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
  },
  padding_sm: {
    padding: SPACING.sm,
  },
  padding_md: {
    padding: SPACING.md,
  },
  padding_lg: {
    padding: SPACING.lg,
  },
});

export default Card;
