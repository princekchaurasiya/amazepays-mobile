import { TopAppBar } from '@/components/common/TopAppBar';
import { colors, layout } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ms } from 'react-native-size-matters';

const spacing = (n: number) => ms(n * 8);

const categories = [
  { id: 'retail', label: 'Retail', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400' },
  { id: 'gaming', label: 'Gaming', image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400' },
  { id: 'food', label: 'Food', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
  { id: 'lifestyle', label: 'Lifestyle', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400' },
];

const deals = [
  { id: 'apple', title: 'Apple Store', subtitle: 'Up to 8% Pays Back', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900' },
  { id: 'coffee', title: 'Starbucks', subtitle: 'Buy 1 Get 1 Free', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900' },
  { id: 'nike', title: 'Nike Direct', subtitle: '15% Instant Discount', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900' },
];

export default function HomeScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const horizontalPad = spacing(2);
  const shellMaxWidth = layout.contentMaxWidth + horizontalPad * 2;
  const contentWidth = Math.min(windowWidth, shellMaxWidth) - horizontalPad * 2;
  const categoryCardWidth = useMemo(() => (contentWidth - spacing(1.25)) / 2, [contentWidth]);

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ width: '100%', maxWidth: shellMaxWidth }}
        contentContainerStyle={{ paddingBottom: spacing(3) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerWrap, { paddingHorizontal: horizontalPad }]}>
          <TopAppBar />
        </View>

        <View style={[styles.bannerCard, { marginHorizontal: horizontalPad }]}>
          <Text style={styles.bannerTag}>NEW ARRIVAL</Text>
          <Text style={styles.bannerTitle}>Unlock 5% Back{'\n'}on Luxury Tech</Text>
          <Pressable style={({ pressed }) => [styles.bannerButton, { opacity: pressed ? 0.88 : 1 }]}>
            <Text style={styles.bannerButtonText}>Shop Apple Store</Text>
            <Ionicons name="arrow-forward" size={ms(16)} color={colors.primary} />
          </Pressable>
        </View>

        <View style={[styles.balanceCard, { marginHorizontal: horizontalPad }]}>
          <View>
            <Text style={styles.balanceLabel}>AVAILABLE VAULT</Text>
            <Text style={styles.balanceValue}>
              14,250 <Text style={styles.balanceUnit}>PTS</Text>
            </Text>
          </View>
          <View style={styles.balanceIcon}>
            <Ionicons name="wallet-outline" size={ms(20)} color={colors.primary} />
          </View>
        </View>

        <View style={[styles.sectionTitleRow, { marginHorizontal: horizontalPad }]}>
          <Text style={styles.sectionTitle}>Explore Categories</Text>
          <Pressable hitSlop={ms(8)}>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>

        <View style={[styles.categoryGrid, { marginHorizontal: horizontalPad }]}>
          {categories.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.categoryCard,
                { width: categoryCardWidth, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Image source={{ uri: item.image }} style={styles.categoryImage} contentFit="cover" transition={100} />
              <View pointerEvents="none" style={styles.imageOverlay} />
              <Text style={styles.categoryText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginHorizontal: horizontalPad, marginTop: spacing(2.25) }]}>
          Featured Deals
        </Text>

        <View style={{ marginHorizontal: horizontalPad, gap: spacing(1.5), marginTop: spacing(1.25) }}>
          {deals.map((deal) => (
            <Pressable key={deal.id} style={({ pressed }) => [styles.dealCard, { opacity: pressed ? 0.9 : 1 }]}>
              <Image source={{ uri: deal.image }} style={styles.dealImage} contentFit="cover" transition={100} />
              <View pointerEvents="none" style={styles.imageOverlay} />
              <View style={styles.dealBadge}>
                <Ionicons name="card-outline" size={ms(14)} color={colors.primary} />
              </View>
              <View style={styles.dealTextWrap}>
                <Text style={styles.dealTitle}>{deal.title}</Text>
                <Text style={styles.dealSubtitle}>{deal.subtitle}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  headerWrap: {
    paddingTop: spacing(1),
    paddingBottom: spacing(1),
    backgroundColor: colors.background,
  },
  bannerCard: {
    marginTop: spacing(1.5),
    borderRadius: ms(18),
    backgroundColor: '#050A58',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(2.25),
  },
  bannerTag: {
    fontSize: ms(10),
    color: '#A5A7D5',
    letterSpacing: ms(1),
    fontWeight: '700',
  },
  bannerTitle: {
    marginTop: spacing(0.75),
    fontSize: ms(35 / 2),
    lineHeight: ms(24),
    color: colors.onPrimary,
    fontWeight: '800',
  },
  bannerButton: {
    marginTop: spacing(1.5),
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.75),
    borderRadius: ms(10),
    paddingHorizontal: spacing(1.75),
    paddingVertical: spacing(1),
    backgroundColor: colors.accent,
  },
  bannerButtonText: {
    fontSize: ms(14),
    fontWeight: '700',
    color: colors.primary,
  },
  balanceCard: {
    marginTop: spacing(2),
    borderRadius: ms(16),
    backgroundColor: colors.surface,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
    borderWidth: ms(1),
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    fontSize: ms(11),
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: ms(0.6),
  },
  balanceValue: {
    marginTop: spacing(0.5),
    fontSize: ms(34 / 2),
    fontWeight: '800',
    color: colors.primary,
  },
  balanceUnit: {
    fontSize: ms(14),
    color: colors.textMuted,
    fontWeight: '700',
  },
  balanceIcon: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(12),
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitleRow: {
    marginTop: spacing(2.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: ms(24 / 1.35),
    fontWeight: '700',
    color: colors.primary,
  },
  viewAll: {
    fontSize: ms(14),
    color: colors.primaryBright,
    fontWeight: '500',
  },
  categoryGrid: {
    marginTop: spacing(1.25),
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1.25),
  },
  categoryCard: {
    height: ms(110),
    borderRadius: ms(14),
    overflow: 'hidden',
    backgroundColor: colors.surface2,
    justifyContent: 'flex-end',
    padding: spacing(1),
  },
  categoryImage: {
    ...StyleSheet.absoluteFillObject,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  categoryText: {
    fontSize: ms(14),
    color: '#fff',
    fontWeight: '700',
  },
  dealCard: {
    height: ms(160),
    borderRadius: ms(16),
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: spacing(1.75),
  },
  dealImage: {
    ...StyleSheet.absoluteFillObject,
  },
  dealBadge: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  dealTextWrap: {
    marginTop: spacing(1.5),
  },
  dealTitle: {
    fontSize: ms(20),
    color: '#fff',
    fontWeight: '800',
  },
  dealSubtitle: {
    marginTop: spacing(0.4),
    fontSize: ms(14),
    color: '#fff',
    fontWeight: '500',
  },
});
