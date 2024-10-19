import React, { useLayoutEffect } from 'react';
import { ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation.type';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InputItem } from '../components';
import styled from 'styled-components/native';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from '../utils/SnackbarContext';

const ButtonContainer = styled.View`
  position: absolute;
  width: 100%;
  padding-horizontal: 16px;
`;

type FormData = {
  title: string;
  description?: string;
};

const schema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().optional(),
});

export const NewTaskScreen = () => {
  const { showSnackbar } = useSnackbar();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });
  const { bottom } = useSafeAreaInsets();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'New Task',
    });
  }, [navigation]);

  const addTask = async ({
    title,
    description,
  }: {
    title: string;
    description?: string;
  }) => {
    try {
      const body = {
        title,
        status: 'to_do',
      };
      if (description?.length) {
        Object.assign(body, { description });
      }
      await axios.post('http://192.168.1.19:3000/tasks', body);
    } catch (error) {
      console.error(error);
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: addTask,
    onSuccess: () => {
      showSnackbar('Task added successfully', 2000);
      navigation.goBack();
    },
    onError: (error) => console.log({ error }),
  });

  const onSubmit = async ({ title, description }: FormData) => {
    if (!Object.keys(errors).length) {
      mutate({ title, description });
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputItem
              label="Title"
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              error={errors.title?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <InputItem
              label="Description"
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              error={errors.description?.message}
            />
          )}
        />
      </ScrollView>
      <ButtonContainer style={{ bottom }}>
        <Button
          mode="outlined"
          style={{ backgroundColor: 'white' }}
          onPress={handleSubmit(onSubmit)}
          loading={isPending}
        >
          Add Task
        </Button>
      </ButtonContainer>
    </>
  );
};
