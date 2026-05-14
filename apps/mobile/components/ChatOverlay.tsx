import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  Easing,
  LinearTransition,
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCart } from '@/lib/cart';
import { sendChat } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  pending?: boolean;
}

const SUGGESTED = [
  'Two spicy chicken sandwiches and a large water',
  'Order me a quick lunch',
  'Add a mushroom burger with extra cheese',
  'Clear my cart',
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ChatOverlay({ open, onClose }: Props) {
  const items = useCart((s) => s.items);
  const applyActions = useCart((s) => s.applyActions);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi — I'm the bistro assistant. Tell me what you're craving and I'll add it to your cart.",
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!open) Keyboard.dismiss();
    progress.value = withTiming(open ? 1 : 0, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [open, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.7,
    pointerEvents: progress.value > 0.01 ? 'auto' : 'none',
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 900 }],
  }));

  const keyboard = useAnimatedKeyboard();
  const spacerStyle = useAnimatedStyle(() => ({ height: keyboard.height.value }));
  const bottomRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboard.height.value }],
  }));

  const scrollToBottom = () => {
    scrollRef.current?.scrollToEnd({ animated: false });
  };

  useAnimatedReaction(
    () => keyboard.height.value,
    (current, previous) => {
      if (current !== previous) {
        runOnJS(scrollToBottom)();
      }
    },
  );

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: trimmed };
    const pendingMsg: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: '',
      pending: true,
    };
    setMessages((m) => [...m, userMsg, pendingMsg]);
    setInput('');
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // `messages` here is the pre-turn transcript (the setMessages updater
      // above doesn't mutate this closure var) — exactly the history to replay.
      const history = messages
        .filter((m) => m.id !== 'welcome' && !m.pending && m.content.trim())
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await sendChat(trimmed, items, history);
      if (res.actions.length > 0) {
        applyActions(res.actions);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setMessages((m) =>
        m.map((msg) =>
          msg.id === pendingMsg.id
            ? { ...msg, content: res.reply, pending: false }
            : msg,
        ),
      );
    } catch (err) {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === pendingMsg.id
            ? {
                ...msg,
                content: "I couldn't reach the kitchen — check the API server is running.",
                pending: false,
              }
            : msg,
        ),
      );
    } finally {
      setBusy(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  };

  const lastMessage = messages[messages.length - 1];
  const showSuggestions =
    !!lastMessage && lastMessage.role === 'assistant' && !lastMessage.pending;

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
            height: '88%',
          },
          sheetStyle,
        ]}
        className="rounded-t-3xl bg-ink-900 border-t border-ink-700 overflow-hidden"
      >
        <View style={{ flex: 1 }}>
          <View className="items-center pt-3">
            <View className="h-1 w-12 rounded-full bg-ink-600" />
          </View>

          <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-full bg-accent items-center justify-center">
                <Ionicons name="sparkles" size={18} color="#0B0B0E" />
              </View>
              <View className="ml-3">
                <Text className="text-ink-100 text-base font-semibold">Bistro Assistant</Text>
                <Text className="text-ink-400 text-xs">Online · responds in seconds</Text>
              </View>
            </View>
            <Pressable onPress={onClose} className="p-2">
              <Ionicons name="close" size={22} color="#B8B8C0" />
            </Pressable>
          </View>

          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            className="px-5"
            contentContainerStyle={{ paddingVertical: 12 }}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((m) => (
              <View
                key={m.id}
                className={`max-w-[85%] mb-2 px-4 py-2.5 rounded-2xl ${
                  m.role === 'user'
                    ? 'self-end bg-accent rounded-br-md'
                    : 'self-start bg-ink-800 rounded-bl-md'
                }`}
              >
                {m.pending ? (
                  <ActivityIndicator color="#B8B8C0" size="small" />
                ) : (
                  <Text
                    className={
                      m.role === 'user' ? 'text-ink-950 text-base' : 'text-ink-100 text-base'
                    }
                  >
                    {m.content}
                  </Text>
                )}
              </View>
            ))}
            <Animated.View style={spacerStyle} />
          </ScrollView>

          <Animated.View
            layout={LinearTransition.duration(220).easing(Easing.out(Easing.cubic))}
            style={bottomRowStyle}
            className="border-t border-ink-800 bg-ink-900"
          >
            {showSuggestions && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={{ flexGrow: 0, maxHeight: 48 }}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingTop: 10,
                  paddingBottom: 4,
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                {SUGGESTED.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => handleSend(s)}
                    style={{ height: 32 }}
                    className="px-3 items-center justify-center rounded-full bg-ink-800 border border-ink-700"
                  >
                    <Text className="text-ink-200 text-xs">{s}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            <View className="flex-row items-center px-4 py-3">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask for anything — e.g. two spicy chicken sandwiches"
              placeholderTextColor="#5A5A66"
              className="flex-1 text-ink-100 px-4 py-3 bg-ink-800 rounded-2xl"
              onSubmitEditing={() => handleSend(input)}
              onFocus={() =>
                requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }))
              }
              returnKeyType="send"
              editable={!busy}
            />
            <Pressable
              onPress={() => handleSend(input)}
              disabled={busy || !input.trim()}
              className={`ml-2 w-12 h-12 rounded-2xl items-center justify-center ${
                busy || !input.trim() ? 'bg-ink-700' : 'bg-accent'
              }`}
            >
              <Ionicons
                name="arrow-up"
                size={20}
                color={busy || !input.trim() ? '#8A8A95' : '#0B0B0E'}
              />
            </Pressable>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </>
  );
}
