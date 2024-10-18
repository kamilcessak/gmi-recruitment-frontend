import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  View,
  useWindowDimensions,
} from 'react-native';
import axios from 'axios';
import {
  NavigationProp,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation.type';
import { NoteType } from '../types/note.type';
import { ActivityIndicator, Icon, IconButton, Text } from 'react-native-paper';

export const HomeScreen = () => {
  const [notes, setNotes] = useState<NoteType[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true);
      const response = await axios.get('http://192.168.1.19:3000/tasks');
      setNotes(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const markTaskAsDone = async (id: number, status: string) => {
    try {
      setIsTaskUpdating(true);
      const response = await axios.put(`http://192.168.1.19:3000/tasks/${id}`, {
        status: status === 'to_do' ? 'done' : 'to_do',
      });
      console.log('hejka', { response });
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

  useEffect(() => {
    void getTasks();
  }, [isScreenFocused]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await getTasks();
    setIsRefreshing(false);
  }, []);

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <>
      <ScrollView
        contentContainerStyle={{ gap: 16, padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {notes?.map((e, i) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('TaskDetails', { id: e.id })}
            key={`note-${i}-${e.id}`}
            style={{
              padding: 16,
              backgroundColor: 'white',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text variant={'titleMedium'}>{e.title}</Text>
            <TouchableOpacity
              onPress={() => markTaskAsDone(e.id, e.status)}
              style={{
                borderWidth: 1,
                borderColor: 'black',
                borderRadius: 8,
                padding: 4,
                zIndex: 999,
              }}
            >
              {e.status === 'done' ? (
                <Icon source={'check'} size={24} color={'black'} />
              ) : (
                <View style={{ height: 24, width: 24 }} />
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <IconButton
        icon={'plus'}
        size={48}
        onPress={() => navigation.navigate('NewTask')}
        style={{
          position: 'absolute',
          bottom: 32,
          right: 16,
          borderRadius: 16,
          backgroundColor: 'white',
        }}
      />
      {isTaskUpdating && (
        <View
          style={{
            position: 'absolute',
            height,
            width,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <ActivityIndicator />
        </View>
      )}
    </>
  );
};
