import type { Product } from '@/types/models';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ProductCard } from './ProductCard';

type Props = {
  products: Product[];
  onProductPress: (p: Product) => void;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  loadingMore?: boolean;
  ListHeaderComponent?: React.ReactElement | null;
  ListEmptyComponent?: React.ReactElement | null;
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
}: Props) {
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footer}>
            <ActivityIndicator />
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <ProductCard product={item} onPress={() => onProductPress(item)} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 8, flexGrow: 1 },
  row: { justifyContent: 'space-between' },
  footer: { paddingVertical: 16 },
});
