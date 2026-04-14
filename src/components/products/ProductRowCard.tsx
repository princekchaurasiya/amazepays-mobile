import { colors, spacing } from '@/theme';
import type { Product } from '@/types/models';
import { formatInr } from '@/utils/format';
import { getListImageUrl, getProductTitle, isOutOfStock, parsePrice } from '@/utils/product';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  product: Product;
  onPress: () => void;
};

function categoryLine(p: Product): string | null {
  const cats = p.categories;
  if (!cats?.length) return null;
  return cats.map((c) => c.name).join(' · ');
}

function discountLabel(p: Product): string | null {
  const raw = p.discount_percentage;
  if (raw == null || raw === '') return null;
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw));
  if (!Number.isFinite(n) || n <= 0) return null;
  const rounded = Math.round(n * 10) / 10;
  return `Save ${rounded % 1 === 0 ? Math.round(rounded) : rounded}%`;
}

export function ProductRowCard({ product, onPress }: Props) {
  const img = getListImageUrl(product);
  const title = getProductTitle(product);
  const price = parsePrice(product.selling_price ?? product.mrp ?? product.denomination);
  const oos = isOutOfStock(product);
  const sub = categoryLine(product);
  const save = discountLabel(product);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        {img ? (
          <Image source={{ uri: img }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, styles.ph]} />
        )}
        {oos ? (
          <View style={styles.oos}>
            <Text style={styles.oosText}>Out of stock</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {sub ? (
          <Text style={styles.sub} numberOfLines={2}>
            {sub}
          </Text>
        ) : null}
        <Text style={styles.price}>{formatInr(price)}</Text>
        {save ? (
          <View style={styles.saveRow}>
            <Text style={styles.save}>{save}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(1.25),
    marginHorizontal: spacing(2),
    marginBottom: spacing(1.5),
  },
  pressed: { opacity: 0.92 },
  imageWrap: { position: 'relative' },
  image: {
    width: 88,
    height: 88,
    borderRadius: 12,
  },
  ph: { backgroundColor: colors.surface2 },
  oos: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
 },
  oosText: { color: colors.onPrimary, fontSize: 10, fontWeight: '700' },
  body: {
    flex: 1,
    marginLeft: spacing(1.5),
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  sub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  price: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  save: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '800',
  },
});
