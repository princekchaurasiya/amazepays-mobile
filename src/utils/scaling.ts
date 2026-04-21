import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

/**
 * Central scaling helpers.
 * - Use `ms` for most typography and spacing values.
 * - Keep factor modest for predictable cross-device UI behavior.
 */
export const ms = (size: number, factor ?:number) => moderateScale(size, factor);
export const hs = (size: number) => scale(size);
export const vs = (size: number) => verticalScale(size);
