import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="plants/modal"
        options={{
          presentation: 'modal',
          headerTitle: 'Add Plant',
        }}
      />
    </Stack>
  );
}