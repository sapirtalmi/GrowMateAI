// components/OptionSelector.tsx
import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface Props {
  label: string;
  options: string[];
  value: string;
  onSelect: (value: string) => void;
  allowCustom?: boolean;
}

export default function OptionSelector({ label, options, value, onSelect, allowCustom = true }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.grid}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.option,
              value === option && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => onSelect(option)}
          >
            <Text style={[styles.optionText, value === option && { color: '#fff' }]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {allowCustom && (
        <TextInput
          style={styles.input}
          placeholder="Other..."
          placeholderTextColor="#777"
          value={value && !options.includes(value) ? value : ''}
          onChangeText={(text) => onSelect(text)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontWeight: 'bold', marginBottom: 8 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    backgroundColor: '#e0ffe0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionText: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  input: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
});
