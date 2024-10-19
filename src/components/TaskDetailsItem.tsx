import { Text } from 'react-native-paper';
import { View } from 'react-native';
import React, { FC } from 'react';

type Props = { title: string; value?: string };

export const TaskDetailsItem: FC<Props> = ({ title, value }) => (
  <View style={{ gap: 4 }}>
    <Text variant={'titleMedium'}>{title}</Text>
    <Text variant={'bodyMedium'}>{value}</Text>
  </View>
);
