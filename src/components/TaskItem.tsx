import { Icon, Text } from 'react-native-paper';
import { View } from 'react-native';
import React, { Dispatch, FC, SetStateAction } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation.type';
import axios from 'axios';
import { TaskType } from '../types/task.type';
import styled from 'styled-components/native';

const TaskItemContainer = styled.TouchableOpacity`
  padding: 16px;
  background-color: white;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
`;

const TaskStatusItem = styled.TouchableOpacity`
  border-width: 1px;
  border-color: black;
  border-radius: 8px;
  padding: 4px;
  z-index: 999;
`;

type Props = {
  task: TaskType;
  setIsTaskUpdating: Dispatch<SetStateAction<boolean>>;
  setNotes: Dispatch<SetStateAction<TaskType[] | null>>;
};

export const TaskItem: FC<Props> = ({ task, setIsTaskUpdating, setNotes }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const markTaskAsDone = async () => {
    try {
      setIsTaskUpdating(true);
      const response = await axios.put(
        `http://192.168.1.19:3000/tasks/${task.id}`,
        {
          status: task.status === 'to_do' ? 'done' : 'to_do',
        }
      );
      setNotes(
        (prev) =>
          prev &&
          prev.map((e) => (e.id === response.data.id ? response.data : e))
      );
      setIsTaskUpdating(false);
    } catch (error) {
      console.error(error);
      setIsTaskUpdating(false);
    }
  };

  return (
    <TaskItemContainer
      onPress={() => navigation.navigate('TaskDetails', { id: task.id })}
    >
      <Text variant={'titleMedium'}>{task.title}</Text>
      <TaskStatusItem onPress={markTaskAsDone}>
        {task.status === 'done' ? (
          <Icon source={'check'} size={24} color={'black'} />
        ) : (
          <View style={{ height: 24, width: 24 }} />
        )}
      </TaskStatusItem>
    </TaskItemContainer>
  );
};
