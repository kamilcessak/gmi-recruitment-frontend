import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  RefreshControl,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import axios from 'axios';
import {
  NavigationProp,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation.type';
import { TaskType } from '../types/task.type';
import {
  ActivityIndicator,
  Button,
  IconButton,
  Text,
} from 'react-native-paper';
import { TaskItem } from '../components';
import styled from 'styled-components/native';
import { useQuery } from '@tanstack/react-query';

const NewTaskIcon = styled(IconButton)`
  position: absolute;
  bottom: 32px;
  right: 16px;
  border-radius: 16px;
  background-color: white;
`;

const AbsoluteActivityIndicator = styled.View`
  position: absolute;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ErrorContainer = styled.View`
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

export const HomeScreen = () => {
  const [notes, setNotes] = useState<TaskType[] | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTaskUpdating, setIsTaskUpdating] = useState(false);

  const isScreenFocused = useIsFocused();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { height, width } = useWindowDimensions();

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Task List' });
  }, [navigation]);

  const getTasks = async () => {
    try {
      const response = await axios.get(`http://${process.env.EXPO_PUBLIC_API_URL}/tasks`);
      setNotes(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  const { isLoading, error, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });

  useEffect(() => {
    void refetch();
  }, [isScreenFocused]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, []);

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} />;

  if (error)
    return (
      <ErrorContainer>
        <Text variant={'titleLarge'}>Error fetching tasks</Text>
        <Button
          onPress={() => refetch()}
          style={{ borderWidth: 1, borderColor: 'black' }}
        >
          <Text variant={'titleMedium'}>Retry</Text>
        </Button>
      </ErrorContainer>
    );

  return (
    <>
      <ScrollView
        contentContainerStyle={{ gap: 16, padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {!notes?.length ? (
          <View
            style={{
              height: height / 1.25,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text variant={'headlineSmall'}>Task list is empty</Text>
          </View>
        ) : (
          notes?.map((e, i) => (
            <TaskItem
              key={`task-item-${e.id}}-${i}`}
              setIsTaskUpdating={setIsTaskUpdating}
              task={e}
              setNotes={setNotes}
            />
          ))
        )}
      </ScrollView>
      <NewTaskIcon
        icon={'plus'}
        size={48}
        onPress={() => navigation.navigate('NewTask')}
      />
      {isTaskUpdating && (
        <AbsoluteActivityIndicator style={{ height, width }}>
          <ActivityIndicator />
        </AbsoluteActivityIndicator>
      )}
    </>
  );
};
