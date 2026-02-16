import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Found',
  message = 'There is nothing to show here yet.',
  icon,
}) => {
  return (
    <View style={styles.container}>
      {icon && <Image source={icon} style={styles.icon} />}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: SPACING.lg,
    opacity: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default EmptyState;
