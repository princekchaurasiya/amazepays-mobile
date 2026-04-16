import { colors, spacing } from '@/theme';
import type { Product } from '@/types/models';
import { formatInr } from '@/utils/format';
import { getListImageUrl, getProductTitle, isOutOfStock, parsePrice } from '@/utils/product';
import { Image } from 'expo-image';
import { Platform, Pressable, Text, View } from 'react-native';

type Props = {
  product: Product;
  onPress: () => void;
};

export function ProductCard({ product, onPress }: Props) {
  const img = getListImageUrl(product);
  const title = getProductTitle(product);
  const price = parsePrice(product.selling_price ?? product.mrp ?? product.denomination);
  const oos = isOutOfStock(product);

  return (
    <Pressable
      onPress={onPress}
      className="m-1 max-w-[50%] flex-1 overflow-hidden rounded-xl border border-border bg-surface"
      style={({ pressed }) => [
        Platform.select({
          ios: {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
          },
          android: { elevation: 4 },
          default: {},
        }),
        pressed && { opacity: 0.9 },
      ]}
    >
      <View className="relative">
        {img ? (
          <Image source={{ uri: img }} style={{ width: '100%', aspectRatio: 1 }} contentFit="cover" />
        ) : (
          <View className="bg-surface2" style={{ width: '100%', aspectRatio: 1 }} />
        )}
        {oos ? (
          <View className="absolute bottom-2 left-2 rounded-md bg-danger px-2 py-1">
            <Text className="text-[10px] font-semibold text-on-primary">Out of stock</Text>
          </View>
        ) : null}
      </View>
      <Text className="mt-2 px-3 text-sm font-semibold text-text" numberOfLines={2}>
        {title}
      </Text>
      <Text className="px-3 pb-3 text-[13px] font-bold text-primary">{formatInr(price)}</Text>
    </Pressable>
  );
}
