import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { saveContent, unsaveContent } from '../store/slices/savedContentSlice';
import { savedContentService } from '../api/services/savedContent.service';
import { COLORS } from '../constants/colors';

interface SaveButtonProps {
  contentType: 'post' | 'test' | 'pdf';
  contentId: string;
  size?: number;
  color?: string;
  activeColor?: string;
  onSaveSuccess?: () => void;
  onUnsaveSuccess?: () => void;
  showFeedback?: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({
  contentType,
  contentId,
  size = 22,
  color = '#6B7280',
  activeColor = COLORS.primary,
  onSaveSuccess,
  onUnsaveSuccess,
  showFeedback = true,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkSavedStatus = useCallback(async () => {
    try {
      setChecking(true);
      const response = await savedContentService.checkIfSaved({
        contentType,
        contentId,
      });
      console.log('Check saved response:', response);
      if (response && typeof response.isSaved === 'boolean') {
        console.log('Setting isSaved to:', response.isSaved);
        setIsSaved(response.isSaved);
      } else {
        console.log('Invalid response:', response);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    } finally {
      setChecking(false);
    }
  }, [contentType, contentId]);

  useEffect(() => {
    checkSavedStatus();
  }, [checkSavedStatus]);

  const handlePress = async () => {
    if (loading) return;

    try {
      setLoading(true);

      if (isSaved) {
        // Unsave
        await dispatch(unsaveContent({ contentType, contentId })).unwrap();
        setIsSaved(false);
        
        if (showFeedback) {
          Alert.alert('Removed', 'Content removed from saved items');
        }
        
        onUnsaveSuccess?.();
      } else {
        // Save
        await dispatch(saveContent({ contentType, contentId })).unwrap();
        setIsSaved(true);
        
        if (showFeedback) {
          Alert.alert('Saved', 'Content saved successfully');
        }
        
        onSaveSuccess?.();
      }
    } catch (error: any) {
      console.error('Error toggling save:', error);
      Alert.alert('Error', error.message || 'Failed to update saved status');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <TouchableOpacity style={styles.button} disabled>
        <ActivityIndicator size="small" color={color} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isSaved ? activeColor : color} />
      ) : (
        <Icon
          name={isSaved ? 'bookmark' : 'bookmark-outline'}
          size={size}
          color={isSaved ? activeColor : color}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SaveButton;
