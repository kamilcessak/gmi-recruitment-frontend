import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation.type';

type FormData = {
  title: string;
  description?: string;
};

const schema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().optional(),
});

export const NewTaskScreen = () => {
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const addTask = async (title: string, description?: string) => {
    try {
      setIsLoading(true);
      const body = {
        title,
        status: 'to_do',
      };
      if (description?.length) {
        Object.assign(body, { description });
      }
      const response = await axios.post('http://192.168.1.19:3000/notes', body);
      console.log({ response });
      setIsLoading(false);
      if (response.status === 201) {
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const onSubmit = async ({ title, description }: FormData) => {
    console.log('hejka', { title, description });
    if (!Object.keys(errors).length) {
      await addTask(title, description);
    }
  };

  console.log({ errors }, Object.keys(errors).length);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              label="Title"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.title}
            />
            {errors.title && (
              <Text style={{ color: 'red' }}>{errors.title?.message}</Text>
            )}
          </View>
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              label="Description"
              multiline
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={!!errors.description}
            />
            {errors.description && (
              <Text style={{ color: 'red' }}>
                {errors.description?.message}
              </Text>
            )}
          </View>
        )}
      />
      <Button
        mode="outlined"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
      >
        Add Task
      </Button>
    </ScrollView>
  );
};
