import React, { FC, useLayoutEffect, useState } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import axios from 'axios';
import {
  ActivityIndicator,
  Button,
  IconButton,
  Provider as PaperProvider,
  Text,
} from 'react-native-paper';
import styled from 'styled-components/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { RootStackParamList } from '../types/navigation.type';
import { FormData, TaskType } from '../types/task.type';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { EditModeDetails, TaskDetails } from '../components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSnackbar } from '../utils/SnackbarContext';

const AbsoluteIndicatorStyle = styled.View`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
`;

const EditModeButtons = styled.View`
  position: absolute;
  width: 100%;
  padding-horizontal: 16px;
  gap: 16px;
`;

const IconButtonsContainer = styled.View`
  position: absolute;
  bottom: 16px;
  right: 16px;
`;

const StyledIconButton = styled(IconButton)`
  border-color: black;
  border-width: 1px;
  border-radius: 24px;
  background-color: white;
`;

const ErrorContainer = styled.View`
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

type DetailsScreenRouteProp = RouteProp<RootStackParamList, 'TaskDetails'>;

const schema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().optional(),
});

export const TaskDetailsScreen: FC<{ route: DetailsScreenRouteProp }> = ({
  route: { params },
}) => {
  const [taskData, setTaskData] = useState<TaskType | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('to_do');

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { height, width } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const { bottom } = useSafeAreaInsets();
  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const handleDeleteTask = async () => {
    try {
      await axios.delete(`http://192.168.1.19:3000/tasks/${params.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const { mutate: deleteTask, isPending: isDeleting } = useMutation({
    mutationFn: handleDeleteTask,
    onSuccess: () => {
      showSnackbar('Task deleted successfully', 2000);
      navigation.goBack();
    },
    onError: (error) => showSnackbar(error.message, 2000),
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Task Details',
    });
  }, [navigation]);

  const getTask = async () => {
    try {
      const response = await axios.get(
        `http://192.168.1.19:3000/tasks/${params.id}`
      );
      if (response.status === 200) {
        setTaskData(response.data);
        setValue('title', response.data.title);
        setValue('description', response.data.description);
        setCurrentStatus(response.data.status);
      }
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  const { isLoading, error, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTask,
  });

  const handleUpdateTask = async (data: FormData) => {
    try {
      await axios.put(`http://192.168.1.19:3000/tasks/${params.id}`, {
        ...data,
        status: currentStatus,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handleUpdateTask,
    onSuccess: async () => {
      showSnackbar('Task updated successfully', 2000);
      setEditMode(false);
      await refetch();
    },
    onError: (error) => showSnackbar(error.message, 2000),
  });

  const onSubmit = (data: FormData) => {
    mutate(data);
  };

  if (isLoading || isPending) return <ActivityIndicator style={{ flex: 1 }} />;

  if (error)
    return (
      <ErrorContainer>
        <Text variant={'titleLarge'}>Error fetching task</Text>
        <Button
          onPress={() => refetch()}
          style={{ borderWidth: 1, borderColor: 'black' }}
        >
          <Text variant={'titleMedium'}>Retry</Text>
        </Button>
      </ErrorContainer>
    );

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {!editMode ? (
          <TaskDetails taskData={taskData} />
        ) : (
          <EditModeDetails
            control={control}
            errors={errors}
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
          />
        )}
      </ScrollView>
      {isDeleting && (
        <AbsoluteIndicatorStyle
          style={{
            height: height - headerHeight,
            width,
          }}
        >
          <ActivityIndicator />
        </AbsoluteIndicatorStyle>
      )}
      {editMode && (
        <EditModeButtons style={{ bottom }}>
          <Button
            mode={'outlined'}
            onPress={() => setEditMode(false)}
            style={{ backgroundColor: 'white' }}
          >
            Cancel
          </Button>
          <Button
            mode={'outlined'}
            onPress={() => deleteTask()}
            textColor={'red'}
            style={{ backgroundColor: 'white' }}
          >
            Delete
          </Button>
          <Button
            mode={'outlined'}
            onPress={handleSubmit(onSubmit)}
            style={{ backgroundColor: 'white' }}
          >
            Save
          </Button>
        </EditModeButtons>
      )}
      {!editMode && (
        <IconButtonsContainer>
          <StyledIconButton
            icon="pencil"
            size={30}
            onPress={() => setEditMode((prev) => !prev)}
          />
          <StyledIconButton
            icon="delete"
            size={30}
            onPress={() => deleteTask()}
          />
        </IconButtonsContainer>
      )}
    </PaperProvider>
  );
};
