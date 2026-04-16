import type { Product } from '@/types/models';
import {
  ActivityIndicator,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { ProductCard } from './ProductCard';
import { ProductRowCard } from './ProductRowCard';
import type { StyleProp, ViewStyle } from 'react-native';

type Props = {
  products: Product[];
  onProductPress: (p: Product) => void;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  loadingMore?: boolean;
  ListHeaderComponent?: React.ReactElement | null;
  ListEmptyComponent?: React.ReactElement | null;
  /** `rows` = Hubble-style vertical list; `grid` = 2-column cards */
  variant?: 'grid' | 'rows';
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshProgressViewOffset?: number;
};

export function ProductList({
  products,
  onProductPress,
  onEndReached,
  onRefresh,
  refreshing,
  loadingMore,
  ListHeaderComponent,
  ListEmptyComponent,
  variant = 'grid',
  onScroll,
  scrollEventThrottle,
  contentContainerStyle,
  refreshProgressViewOffset,
}: Props) {
  const isRows = variant === 'rows';

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => String(item.id)}
      numColumns={isRows ? 1 : 2}
      columnWrapperStyle={isRows ? undefined : styles.row}
      contentContainerStyle={[
        isRows ? styles.listRows : styles.list,
        contentContainerStyle,
      ]}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            progressViewOffset={refreshProgressViewOffset}
          />
        ) : undefined
      }
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle ?? (onScroll ? 16 : undefined)}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footer}>
            <ActivityIndicator />
          </View>
        ) : null
      }
      renderItem={({ item }) =>
        isRows ? (
          <ProductRowCard product={item} onPress={() => onProductPress(item)} />
        ) : (
          <ProductCard product={item} onPress={() => onProductPress(item)} />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 8, flexGrow: 1 },
  listRows: { paddingTop: 8, paddingBottom: 16, flexGrow: 1 },
  row: { justifyContent: 'space-between' },
  footer: { paddingVertical: 16 },
});
