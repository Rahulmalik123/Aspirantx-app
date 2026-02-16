import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import CustomIcon from '../CustomIcon';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
  titleStyle?: any;
  containerStyle?: any;
  showExamSelector?: boolean;
  selectedExamName?: string;
  onExamSelectorPress?: () => void;
  // Home header specific props
  isHomeHeader?: boolean;
  userName?: string;
  userInitial?: string;
  coins?: number;
  onCoinsPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  showBackButton = true,
  rightComponent,
  backgroundColor = COLORS.white,
  titleStyle,
  containerStyle,
  showExamSelector = false,
  selectedExamName,
  onExamSelectorPress,
  isHomeHeader = false,
}) => {
  if (isHomeHeader) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
        <View style={[styles.homeHeader, { backgroundColor }, containerStyle]}>
          <View style={styles.homeHeaderTop}>
            {/* Logo and Exam Selector - Left side grouped */}
            <View style={styles.leftSection}>
              <Image 
                source={require('../../assets/images/logo.jpeg')} 
                style={styles.logo}
                resizeMode="contain"
              />
              
              {showExamSelector && (
                <TouchableOpacity 
                  style={styles.examSelectorCompact}
                  onPress={onExamSelectorPress}
                  activeOpacity={0.7}
                >
                  <CustomIcon name="school" size={16} color={COLORS.primary} />
                  <Text style={styles.examSelectorCompactText} numberOfLines={1}>
                    {selectedExamName || 'My Exam'}
                  </Text>
                  <CustomIcon name="chevron-down" size={14} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Right side: Coins and Notification */}
            <View style={styles.headerRightSection}>
             

              {/* Notification */}
              {rightComponent && (
                <View style={styles.notificationContainer}>{rightComponent}</View>
              )}
            </View>
          </View>

         
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <View style={[styles.header, { backgroundColor }, containerStyle]}>
        {showBackButton ? (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon name="chevron-back" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}

        <View style={styles.titleContainer}>
          {showExamSelector ? (
            <TouchableOpacity 
              style={styles.examSelector}
              onPress={onExamSelectorPress}
              activeOpacity={0.7}
            >
              <View style={styles.examSelectorContent}>
                <CustomIcon name="school" size={18} color={COLORS.primary} />
                <Text style={styles.examSelectorText} numberOfLines={1}>
                  {selectedExamName || 'Select Your Exam'}
                </Text>
                <CustomIcon name="chevron-down" size={16} color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={[styles.title, titleStyle]} numberOfLines={1}>
                {title}
              </Text>
              {subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </>
          )}
        </View>

        {rightComponent ? (
          <View style={styles.rightContainer}>{rightComponent}</View>
        ) : (
          <View style={styles.backButton} />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 50 : SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 0,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  rightContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examSelector: {
    width: '100%',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  examSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  examSelectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
    maxWidth: '70%',
  },
  // Home Header Styles
  homeHeader: {
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 50 : SPACING.sm,
    paddingBottom: SPACING.md,
    gap: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  logoContainer: {
    alignItems: 'flex-start',
  },
  logo: {
    width: 30,
    height: 32,
    borderRadius: 6,
  },
  homeHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  examSelectorFull: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  examSelectorFullText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  examSelectorCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    maxWidth: '60%',
  },
  examSelectorCompactText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    maxWidth: 120,
  },
  headerRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE4A3',
  },
  coinsText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  notificationContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  profileInfo: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});

export default Header;
