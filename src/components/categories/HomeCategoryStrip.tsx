import { CategoryGlyph } from '@/components/categories/CategoryGlyph';
import { colors, spacing } from '@/theme';
import { getCategoryIconDef } from '@/utils/categoryIcons';
import type { Category } from '@/types/models';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const ITEM_W = 76;

type Props = {
  categories: Category[];
  selectedId: number | undefined;
  onSelect: (id: number | undefined) => void;
};

export function HomeCategoryStrip({ categories, selectedId, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Pressable style={styles.item} onPress={() => onSelect(undefined)}>
        <View style={[styles.iconUnderline, selectedId === undefined && styles.iconUnderlineActive]} />
        <View style={styles.iconWrap}>
          <Ionicons
            name="grid-outline"
            size={26}
            color={selectedId === undefined ? colors.primaryBright : colors.textMuted}
          />
        </View>
        <Text
          style={[styles.label, selectedId === undefined && styles.labelActive]}
          numberOfLines={2}
        >
          All
        </Text>
      </Pressable>
      {categories.map((c) => {
        const active = selectedId === c.id;
        const thumb = c.thumbnail?.trim();
        const showThumb = !!thumb;
        const showGlyph = !showThumb && !!getCategoryIconDef(c.name);
        return (
          <Pressable key={c.id} style={styles.item} onPress={() => onSelect(c.id)}>
            <View style={[styles.iconUnderline, active && styles.iconUnderlineActive]} />
            <View style={styles.iconWrap}>
              {showThumb ? (
                <Image source={{ uri: thumb! }} style={styles.thumb} contentFit="cover" />
              ) : showGlyph ? (
                <CategoryGlyph
                  name={c.name}
                  size={26}
                  accentColor={active ? c.accent_color : null}
                  color={active ? undefined : colors.textMuted}
                />
              ) : (
                <Ionicons
                  name="pricetag-outline"
                  size={24}
                  color={active ? colors.primaryBright : colors.textMuted}
                />
              )}
            </View>
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={2}>
              {c.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(0.75),
  },
  item: {
    width: ITEM_W,
    marginRight: spacing(1),
    alignItems: 'center',
    paddingVertical: spacing(0.5),
    paddingHorizontal: spacing(0.25),
    backgroundColor: 'transparent',
  },
  iconUnderline: {
    alignSelf: 'stretch',
    height: 2,
    borderRadius: 1,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  iconUnderlineActive: {
    backgroundColor: colors.primaryBright,
  },
  iconWrap: {
    height: 36,
    width: ITEM_W - 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  thumb: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 14,
  },
  labelActive: {
    fontWeight: '700',
    color: colors.primaryBright,
  },
});
