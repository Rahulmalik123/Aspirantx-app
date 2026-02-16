import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { FONT_FAMILY } from '../../constants/typography';

export interface CustomTextProps extends TextProps {
  variant?: 'regular' | 'medium' | 'semiBold' | 'bold';
}

const CustomText: React.FC<CustomTextProps> = ({ 
  variant, 
  style, 
  children,
  ...props 
}) => {
  // Determine font family
  let fontFamily = FONT_FAMILY.regular;
  
  // First check if variant is explicitly provided
  if (variant) {
    fontFamily = FONT_FAMILY[variant];
  } 
  // Otherwise check if style has fontWeight
  else if (style && typeof style === 'object' && !Array.isArray(style)) {
    const fontWeight = (style as TextStyle).fontWeight;
    if (fontWeight) {
      switch (fontWeight) {
        case 'bold':
        case '700':
        case '800':
        case '900':
          fontFamily = FONT_FAMILY.bold;
          break;
        case '600':
          fontFamily = FONT_FAMILY.semiBold;
          break;
        case '500':
          fontFamily = FONT_FAMILY.medium;
          break;
        default:
          fontFamily = FONT_FAMILY.regular;
      }
    }
  }

  const fontStyle = {
    fontFamily,
  };

  return (
    <RNText style={[fontStyle, style]} {...props}>
      {children}
    </RNText>
  );
};

// Export as both CustomText and Text for easier migration
export default CustomText;
export const Text = CustomText;
