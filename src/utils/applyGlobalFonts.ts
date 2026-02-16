import { Text, TextInput } from 'react-native';
import { FONT_FAMILY } from '../constants/typography';

// This file is auto-executed when imported
// It applies default Poppins font to all Text and TextInput components

const defaultFontStyle = {
  fontFamily: FONT_FAMILY.regular,
};

// Save original render methods
const TextRender = Text.render;
const TextInputRender = TextInput.render;

// Helper to inject font into component
const injectFont = (OriginalRender: any) =>
  function (this: any, ...args: any[]) {
    const [props, ...restArgs] = args;
    const updatedProps = {
      ...props,
      style: [defaultFontStyle, props.style],
    };
    return OriginalRender.call(this, updatedProps, ...restArgs);
  };

// Override render methods
Text.render = injectFont(TextRender);
TextInput.render = injectFont(TextInputRender);

console.log('✅ [Fonts] Global Poppins font applied to all Text & TextInput components');
