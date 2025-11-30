// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Original
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',

  // App specific icons
  'flame.fill': 'local-fire-department',
  'list.bullet': 'list',
  'person.circle.fill': 'account-circle',
  'gear': 'settings',
  'person.badge.plus': 'person-add',
  'arrow.right.square': 'exit-to-app',
  'exclamationmark.triangle.fill': 'warning',
  'exclamationmark.triangle': 'warning-amber',
  'exclamationmark.circle': 'error-outline',
  'info.circle': 'info-outline',
  'xmark': 'close',
  'checkmark.shield.fill': 'verified-user',
  'checkmark.seal.fill': 'verified',
  'clock.fill': 'schedule',
  'moon.stars': 'nightlight-round',
  'text.bubble': 'chat-bubble-outline',
  'tray': 'inbox',
  'plus.circle.fill': 'add-circle',
  'person.crop.circle': 'account-circle',
  'person': 'person',
  'envelope': 'mail-outline',
  'lock': 'lock',
  'sparkles': 'auto-awesome',
  'hand.thumbsup.fill': 'thumb-up',
  'line.3.horizontal.decrease.circle': 'filter-list',
  'line.3.horizontal.decrease.circle.fill': 'filter-list',
  'chart.bar.fill': 'insert-chart',
  'chart.bar': 'insert-chart',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
