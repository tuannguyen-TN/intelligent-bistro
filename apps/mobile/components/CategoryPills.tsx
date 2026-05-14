import { Pressable, ScrollView, Text } from 'react-native';

interface Props {
  categories: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}

export function CategoryPills({ categories, active, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, maxHeight: 60 }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
        alignItems: 'center',
      }}
    >
      {categories.map((cat) => {
        const isActive = cat.id === active;
        return (
          <Pressable
            key={cat.id}
            onPress={() => onChange(cat.id)}
            style={{ height: 36 }}
            className={`px-4 items-center justify-center rounded-full border ${
              isActive
                ? 'bg-accent border-accent'
                : 'bg-ink-900 border-ink-700'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                isActive ? 'text-ink-950' : 'text-ink-200'
              }`}
            >
              {cat.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
