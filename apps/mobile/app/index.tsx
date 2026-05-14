import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, ListRenderItem, NativeScrollEvent, NativeSyntheticEvent, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { Category, MenuItem } from '@bistro/shared';
import { useCart } from '@/lib/cart';
import { MenuItemCard } from '@/components/MenuItemCard';
import { CategoryPills } from '@/components/CategoryPills';
import { CartDrawer } from '@/components/CartDrawer';
import { ChatOverlay } from '@/components/ChatOverlay';

const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'sandwich', label: 'Sandwiches' },
  { id: 'salad', label: 'Salads' },
  { id: 'side', label: 'Sides' },
  { id: 'drink', label: 'Drinks' },
  { id: 'dessert', label: 'Desserts' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const menu = useCart((s) => s.menu);
  const cartCount = useCart((s) => s.count());
  const addByItem = useCart((s) => s.addByItem);

  const [category, setCategory] = useState<Category | 'all'>('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const menuList = useMemo(() => Object.values(menu), [menu]);
  const filtered = useMemo(
    () => (category === 'all' ? menuList : menuList.filter((m) => m.category === category)),
    [menuList, category],
  );

  const listRef = useRef<FlatList<MenuItem>>(null);
  const scrollOffsets = useRef<Record<string, number>>({});
  const currentOffset = useRef(0);
  const activeCategory = useRef(category);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    currentOffset.current = e.nativeEvent.contentOffset.y;
  };

  const handleCategoryChange = (id: Category | 'all') => {
    if (id === activeCategory.current) return;
    scrollOffsets.current[activeCategory.current] = currentOffset.current;
    activeCategory.current = id;
    setCategory(id);
  };

  useEffect(() => {
    const target = scrollOffsets.current[category] ?? 0;
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: target, animated: false });
      currentOffset.current = target;
    });
  }, [category]);

  const handleAdd = useCallback(
    (item: MenuItem) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addByItem(item, 1, []);
    },
    [addByItem],
  );

  const renderItem = useCallback<ListRenderItem<MenuItem>>(
    ({ item }) => <MenuItemCard item={item} onAdd={handleAdd} />,
    [handleAdd],
  );

  const keyExtractor = useCallback((item: MenuItem) => item.id, []);

  return (
    <View className="flex-1 bg-ink-950">
      <View style={{ paddingTop: insets.top + 8 }} className="px-5 pb-2">
        <Text className="text-ink-400 text-xs uppercase tracking-widest">The Intelligent</Text>
        <Text className="text-ink-100 text-4xl font-serif">Bistro</Text>
      </View>

      <CategoryPills
        categories={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
        active={category}
        onChange={(id) => handleCategoryChange(id as Category | 'all')}
      />

      {menuList.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="restaurant-outline" size={36} color="#5A5A66" />
          <Text className="text-ink-300 text-base mt-3">Loading the menu…</Text>
          <Text className="text-ink-500 text-sm mt-1 text-center">
            Make sure the API server is running on http://localhost:4000
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={filtered}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={renderItem}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={7}
          removeClippedSubviews
        />
      )}

      <View
        style={{ bottom: insets.bottom + 20 }}
        className="absolute right-5 left-5 flex-row items-center justify-between"
      >
        <Pressable
          onPress={() => { Haptics.selectionAsync(); setCartOpen(true); }}
          className="flex-row items-center bg-ink-900 border border-ink-700 rounded-full pl-4 pr-5 py-3 active:opacity-90"
        >
          <Ionicons name="bag-handle" size={20} color="#EFEFF2" />
          <Text className="text-ink-100 ml-2 font-medium">Cart</Text>
          {cartCount > 0 && (
            <View className="ml-2 min-w-[22px] h-[22px] px-1.5 rounded-full bg-accent items-center justify-center">
              <Text className="text-ink-950 text-xs font-bold">{cartCount}</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={() => { Haptics.selectionAsync(); setChatOpen(true); }}
          className="flex-row items-center bg-accent rounded-full pl-4 pr-5 py-3 active:bg-accent-dark"
        >
          <Ionicons name="sparkles" size={20} color="#0B0B0E" />
          <Text className="text-ink-950 ml-2 font-semibold">Ask AI</Text>
        </Pressable>
      </View>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <ChatOverlay open={chatOpen} onClose={() => setChatOpen(false)} />
    </View>
  );
}
