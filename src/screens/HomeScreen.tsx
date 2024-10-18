import React, { useCallback, useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  ScrollView,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import {
  NavigationProp,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation.type';
import { NoteType } from '../types/note.type';
import { ActivityIndicator } from 'react-native-paper';

export const HomeScreen = () => {
  const [notes, setNotes] = useState<NoteType[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isScreenFocused = useIsFocused();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const getNotes = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://192.168.1.19:3000/notes');
      setNotes(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void getNotes();
  }, [isScreenFocused]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await getNotes();
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
        {notes?.map((e, i) => {
          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('TaskDetails', { id: e.id })}
              key={`note-${i}-${e.id}`}
              style={{
                padding: 16,
                backgroundColor: 'white',
              }}
            >
              <Text>{e.title}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <TouchableOpacity
        onPress={() => navigation.navigate('NewTask')}
        style={{
          position: 'absolute',
          bottom: 32,
          right: 32,
          padding: 16,
          borderRadius: 16,
          backgroundColor: 'red',
        }}
      >
        <Text>Add</Text>
      </TouchableOpacity>
    </>
  );
};
