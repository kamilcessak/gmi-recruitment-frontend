import { Text, TextInput } from 'react-native-paper';
import { View } from 'react-native';
import React, { FC } from 'react';

type Props = {
  onBlur: () => void;
  onChange: () => void;
  value?: string;
  error?: string;
  label: string;
};

export const InputItem: FC<Props> = ({
  onBlur,
  onChange,
  value,
  error,
  label,
}) => {
  return (
    <View>
      <TextInput
        label={label}
        onBlur={onBlur}
        onChangeText={onChange}
        value={value}
        error={!!error}
        mode="outlined"
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
};
