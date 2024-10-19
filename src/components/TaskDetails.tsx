import React, { FC } from 'react';
import { TaskDetailsItem } from './TaskDetailsItem';
import { TaskType } from '../types/task.type';
import { View } from 'react-native';
import { Divider } from 'react-native-paper';
import styled from 'styled-components/native';

const Container = styled.View`
  background-color: white;
  border-radius: 16px;
  padding: 16px;
  gap: 16px;
`;

type Props = { taskData: TaskType | null };

export const TaskDetails: FC<Props> = ({ taskData }) => {
  const detailsItems = [
    { title: 'Title:', value: taskData?.title },
    { title: 'Description:', value: taskData?.description },
    { title: 'Task status:', value: taskData?.status },
    { title: 'Created at:', value: taskData?.created_at },
  ];

  return (
    <Container>
      {detailsItems.map(({ value, title }, i) => (
        <View key={`task-details-item-${i}-${value}`} style={{ gap: 8 }}>
          <TaskDetailsItem title={title} value={value} />
          {i < detailsItems.length - 1 && <Divider style={{ marginTop: 8 }} />}
        </View>
      ))}
    </Container>
  );
};
