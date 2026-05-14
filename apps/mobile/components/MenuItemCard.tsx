import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import type { MenuItem } from '@bistro/shared';
import { formatPrice } from '@/lib/format';

interface Props {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

function MenuItemCardImpl({ item, onAdd }: Props) {
  return (
    <View className="mb-4 overflow-hidden rounded-3xl bg-ink-900 border border-ink-800">
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={{ width: '100%', height: 180 }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View className="h-44 w-full bg-ink-800" />
      )}
      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-ink-100 text-lg font-semibold">{item.name}</Text>
            <Text className="text-ink-400 text-sm mt-1" numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          <Text className="text-accent text-base font-semibold">{formatPrice(item.price)}</Text>
        </View>

        {item.tags && item.tags.length > 0 && (
          <View className="flex-row flex-wrap mt-3 gap-1.5">
            {item.tags.slice(0, 3).map((tag) => (
              <View key={tag} className="px-2 py-1 rounded-full bg-ink-800">
                <Text className="text-ink-300 text-xs">{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onAdd(item);
          }}
          className="mt-4 flex-row items-center justify-center rounded-2xl bg-accent active:bg-accent-dark py-3"
        >
          <Ionicons name="add" size={18} color="#0B0B0E" />
          <Text className="ml-1 text-ink-950 font-semibold">Add to cart</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const MenuItemCard = memo(MenuItemCardImpl);
