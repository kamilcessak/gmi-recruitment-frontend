import { Control, Controller, FieldErrors } from 'react-hook-form';
import { View } from 'react-native';
import { Dropdown } from 'react-native-paper-dropdown';
import React, { Dispatch, FC, SetStateAction } from 'react';
import { FormData } from '../types/task.type';
import { InputItem } from './InputItem';

type Props = {
  control: Control<FormData, any>;
  errors: FieldErrors<FormData>;
  currentStatus: string;
  setCurrentStatus: Dispatch<SetStateAction<string>>;
};

const StatusItems = [
  { label: 'To do', value: 'to_do' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
];

export const EditModeDetails: FC<Props> = ({
  control,
  errors,
  currentStatus,
  setCurrentStatus,
}) => {
  return (
    <View style={{ gap: 16 }}>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <InputItem
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
            onBlur={onBlur}
            onChange={onChange}
            value={value}
            error={errors.description?.message}
          />
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
};
