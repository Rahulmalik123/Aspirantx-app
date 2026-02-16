import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIconsNative from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';

interface CustomIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
  type?: 'ionicon' | 'material' | 'material-community' | 'font-awesome' | 'font-awesome5' | 'feather';
}

const CustomIcon: React.FC<CustomIconProps> = ({
  name,
  size = 24,
  color = '#000',
  style,
  type = 'ionicon',
}) => {
  switch (type) {
    case 'material':
      return <MaterialIconsNative name={name} size={size} color={color} style={style} />;
    case 'material-community':
      return <MaterialIcon name={name} size={size} color={color} style={style} />;
    case 'font-awesome':
      return <FontAwesome name={name} size={size} color={color} style={style} />;
    case 'font-awesome5':
      return <FontAwesome5 name={name} size={size} color={color} style={style} />;
    case 'feather':
      return <Feather name={name} size={size} color={color} style={style} />;
    case 'ionicon':
    default:
      return <Icon name={name} size={size} color={color} style={style} />;
  }
};

export default CustomIcon;
