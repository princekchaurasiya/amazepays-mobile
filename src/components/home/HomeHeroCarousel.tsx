import type { HomeSlide } from '@/types/models';
import { colors, spacing } from '@/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

/** ~1344×736 style hero; keeps height consistent across devices */
const BANNER_ASPECT = 1344 / 736;

type Props = {
  slides: HomeSlide[];
};

export function HomeHeroCarousel({ slides }: Props) {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const items = slides.filter((s) => s.image_mobile || s.desktop_image);
  if (items.length === 0) return null;

  const slideWidth = windowWidth;
  const slideHeight = Math.round(slideWidth / BANNER_ASPECT);

  const onPress = (s: HomeSlide) => {
    if (!s.is_linked) return;
    const raw = (s.custom_url || s.cta_link || '').trim();
    if (raw && /^https?:\/\//i.test(raw)) {
      void Linking.openURL(raw);
      return;
    }
    if (s.product_id) {
      router.push(`/product/${s.product_id}`);
      return;
    }
    if (s.category_id) {
      router.push({
        pathname: '/(tabs)/browse',
        params: { category_id: String(s.category_id) },
      });
      return;
    }
    if (s.brand_id) {
      router.push({
        pathname: '/(tabs)/browse',
        params: { brand_id: String(s.brand_id) },
      });
    }
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={slideWidth}
        snapToAlignment="start"
      >
        {items.map((s) => {
          const uri = s.image_mobile ?? s.desktop_image ?? '';
          return (
            <Pressable
              key={s.id}
              onPress={() => onPress(s)}
              style={[styles.slide, { width: slideWidth, height: slideHeight }]}
              accessibilityRole={s.is_linked ? 'button' : 'image'}
              accessibilityLabel={s.img_alt_tag ?? 'Promotional banner'}
            >
              <Image
                source={{ uri }}
                style={styles.image}
                contentFit="cover"
                accessibilityIgnoresInvertColors
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing(1),
  },
  slide: {
    backgroundColor: colors.surface2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
