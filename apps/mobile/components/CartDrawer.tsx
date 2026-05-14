import { useEffect } from 'react';
import { Pressable, Text, View, ScrollView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: Props) {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [open, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.7,
    pointerEvents: progress.value > 0.01 ? 'auto' : 'none',
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 800 }],
  }));

  return (
    <>
      <Animated.View
        style={[
          {
            position: 'absolute',
            inset: 0,
            backgroundColor: '#000',
          },
          backdropStyle,
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            maxHeight: '85%',
          },
          sheetStyle,
        ]}
        className="rounded-t-3xl bg-ink-900 border-t border-ink-700"
      >
        <View className="items-center pt-3">
          <View className="h-1 w-12 rounded-full bg-ink-600" />
        </View>

        <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
          <Text className="text-ink-100 text-2xl font-serif">Your cart</Text>
          {items.length > 0 && (
            <Pressable onPress={() => { Haptics.selectionAsync(); clear(); }}>
              <Text className="text-ink-400 text-sm">Clear</Text>
            </Pressable>
          )}
        </View>

        {items.length === 0 ? (
          <View className="px-5 py-10 items-center">
            <Ionicons name="bag-outline" size={36} color="#5A5A66" />
            <Text className="text-ink-400 text-base mt-3">Your cart is empty.</Text>
            <Text className="text-ink-500 text-sm mt-1">Tap an item or ask the assistant.</Text>
          </View>
        ) : (
          <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 16 }}>
            {items.map((line) => (
              <View
                key={line.lineId}
                className="flex-row items-start py-3 border-b border-ink-800"
              >
                <View className="flex-1 pr-3">
                  <Text className="text-ink-100 text-base font-medium">{line.name}</Text>
                  {line.modifiers.length > 0 && (
                    <Text className="text-ink-400 text-xs mt-1">
                      {line.modifiers.map((m) => m.label).join(' · ')}
                    </Text>
                  )}
                  <Text className="text-ink-300 text-sm mt-1">
                    {formatPrice(line.unitPrice)} each
                  </Text>
                </View>

                <View className="flex-row items-center bg-ink-800 rounded-full">
                  <Pressable
                    className="w-9 h-9 items-center justify-center"
                    onPress={() => {
                      Haptics.selectionAsync();
                      setQuantity(line.lineId, line.quantity - 1);
                    }}
                  >
                    <Ionicons name="remove" size={16} color="#EFEFF2" />
                  </Pressable>
                  <Text className="text-ink-100 w-6 text-center">{line.quantity}</Text>
                  <Pressable
                    className="w-9 h-9 items-center justify-center"
                    onPress={() => {
                      Haptics.selectionAsync();
                      setQuantity(line.lineId, line.quantity + 1);
                    }}
                  >
                    <Ionicons name="add" size={16} color="#EFEFF2" />
                  </Pressable>
                </View>

                <Pressable
                  className="ml-2 w-9 h-9 items-center justify-center"
                  onPress={() => { Haptics.selectionAsync(); remove(line.lineId); }}
                >
                  <Ionicons name="trash-outline" size={18} color="#8A8A95" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        {items.length > 0 && (
          <View className="px-5 pt-3 pb-8 border-t border-ink-800">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-ink-300 text-sm">Subtotal</Text>
              <Text className="text-ink-100 text-xl font-semibold">{formatPrice(total)}</Text>
            </View>
            <Pressable className="rounded-2xl bg-accent active:bg-accent-dark py-4 items-center">
              <Text className="text-ink-950 font-semibold text-base">Checkout</Text>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </>
  );
}
