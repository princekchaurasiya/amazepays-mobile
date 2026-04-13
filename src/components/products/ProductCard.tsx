import { colors, spacing } from '@/theme';
import type { Product } from '@/types/models';
import { formatInr } from '@/utils/format';
import { getListImageUrl, getProductTitle, isOutOfStock, parsePrice } from '@/utils/product';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        {img ? (
          <Image source={{ uri: img }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, styles.ph]} />
        )}
        {oos ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Out of stock</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.price}>{formatInr(price)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: spacing(0.5),
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    maxWidth: '50%',
  },
  pressed: { opacity: 0.9 },
  imageWrap: { position: 'relative' },
  image: { width: '100%', aspectRatio: 1 },
  ph: { backgroundColor: colors.surface2 },
  badge: {
    position: 'absolute',
    bottom: spacing(0.5),
    left: spacing(0.5),
    backgroundColor: colors.danger,
    paddingHorizontal: spacing(0.75),
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { color: colors.text, fontSize: 10, fontWeight: '600' },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: spacing(1),
    marginTop: spacing(0.75),
  },
  price: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: spacing(1),
    paddingBottom: spacing(1),
  },
});
