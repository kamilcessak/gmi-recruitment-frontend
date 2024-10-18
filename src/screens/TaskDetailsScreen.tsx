import React, {
  FC,
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
  useMemo,
} from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import axios from 'axios';
import {
  ActivityIndicator,
  IconButton,
  TextInput,
  Provider as PaperProvider,
  Button,
  Text,
} from 'react-native-paper';
import { useHeaderHeight } from '@react-navigation/elements';
import { Dropdown } from 'react-native-paper-dropdown';
import { RootStackParamList } from '../types/navigation.type';
import { NoteType } from '../types/note.type';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { TaskDetailsItem } from '../components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DetailsScreenRouteProp = RouteProp<RootStackParamList, 'TaskDetails'>;

type FormData = {
  title: string;
  description?: string;
};

const schema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().optional(),
});

const StatusItems = [
  { label: 'To do', value: 'to_do' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
];

export const TaskDetailsScreen: FC<{ route: DetailsScreenRouteProp }> = ({
  route: { params },
}) => {
  const [taskData, setTaskData] = useState<NoteType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('to_do');
  const [isUpdating, setIsUpdating] = useState(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { height, width } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const { bottom } = useSafeAreaInsets();

  const detailsItems = useMemo(() => {
    return [
      { title: 'Title:', value: taskData?.title },
      { title: 'Description:', value: taskData?.description },
      { title: 'Task status:', value: taskData?.status },
      { title: 'Created at:', value: taskData?.created_at },
    ];
  }, [taskData]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const handleDeleteTask = async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await axios.delete(
        `http://192.168.1.19:3000/tasks/${id}`
      );
      setIsDeleting(false);
      navigation.goBack();
    } catch (error) {
      console.error(error);
      setIsDeleting(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Task Details',
      // headerRight: () => (
      //   <View
      //     style={{
      //       flexDirection: 'row',
      //       marginRight: -16,
      //     }}
      //   >
      //     <IconButton
      //       icon="pencil"
      //       size={24}
      //       onPress={() => setEditMode((prev) => !prev)}
      //     />
      //     <IconButton
      //       icon="delete"
      //       size={24}
      //       onPress={() => handleDeleteTask(`${params.id}`)}
      //     />
      //   </View>
      // ),
    });
  }, [navigation]);

  const getTask = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://192.168.1.19:3000/tasks/${params.id}`
      );
      if (response.status === 200) {
        setTaskData(response.data);
        setValue('title', response.data.title);
        setValue('description', response.data.description);
        setCurrentStatus(response.data.status);
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void getTask();
  }, []);

  const handleUpdateTask = async (data: FormData) => {
    try {
      setIsUpdating(true);
      const response = await axios.put(
        `http://192.168.1.19:3000/tasks/${params.id}`,
        {
          ...data,
          status: currentStatus,
        }
      );
      setIsUpdating(false);
      setEditMode(false);
      await getTask();
    } catch (error) {
      console.error(error);
      setIsUpdating(false);
    }
  };

  const renderDetailsContent = useCallback(() => {
    return (
      <>
        {detailsItems.map((e, i) => (
          <TaskDetailsItem
            key={`task-details-item-${i}-${e.value}`}
            title={e.title}
            value={e.value}
          />
        ))}
      </>
    );
  }, [taskData]);

  const renderEditModeContent = useCallback(() => {
    return (
      <View style={{ gap: 16 }}>
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
                mode="outlined"
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
                mode="outlined"
              />
              {errors.description && (
                <Text style={{ color: 'red' }}>
                  {errors.description?.message}
                </Text>
              )}
            </View>
          )}
        />
        <Dropdown
          label="Task status"
          placeholder="Select status"
          options={StatusItems}
          mode={'outlined'}
          value={currentStatus}
          onSelect={(value?: string) => {
            value && setCurrentStatus(value);
          }}
          CustomMenuHeader={() => <></>}
        />
      </View>
    );
  }, [editMode, currentStatus]);

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {!editMode ? renderDetailsContent() : renderEditModeContent()}
      </ScrollView>
      {isDeleting && (
        <View
          style={{
            position: 'absolute',
            height: height - headerHeight,
            width,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator />
        </View>
      )}
      {editMode && (
        <View
          style={{
            position: 'absolute',
            bottom,
            width: '100%',
            paddingHorizontal: 16,
            gap: 16,
          }}
        >
          <Button
            mode={'outlined'}
            onPress={() => setEditMode(false)}
            style={{ backgroundColor: 'white' }}
          >
            Cancel
          </Button>
          <Button
            mode={'outlined'}
            onPress={() => handleDeleteTask(`${params.id}`)}
            textColor={'red'}
            style={{ backgroundColor: 'white' }}
          >
            Delete
          </Button>
          <Button
            mode={'outlined'}
            onPress={handleSubmit(handleUpdateTask)}
            style={{ backgroundColor: 'white' }}
          >
            Save
          </Button>
        </View>
      )}
      {!editMode && (
        <View style={{ position: 'absolute', bottom: 16, right: 16 }}>
          <IconButton
            icon="pencil"
            size={30}
            onPress={() => setEditMode((prev) => !prev)}
            style={{
              borderColor: 'black',
              borderWidth: 1,
              borderRadius: 24,
            }}
          />
          <IconButton
            icon="delete"
            size={30}
            onPress={() => handleDeleteTask(`${params.id}`)}
            style={{
              borderColor: 'black',
              borderWidth: 1,
              borderRadius: 24,
            }}
          />
        </View>
      )}
    </PaperProvider>
  );
};
