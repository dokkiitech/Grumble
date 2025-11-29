import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const BONFIRE_Y = SCREEN_HEIGHT * 0.25; // 火の位置（上部25%）
export const CARD_AREA_Y = SCREEN_HEIGHT * 0.5; // カードエリアの開始位置
export { SCREEN_WIDTH, SCREEN_HEIGHT };

