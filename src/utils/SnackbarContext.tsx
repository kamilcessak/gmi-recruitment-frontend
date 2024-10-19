import React, {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { Snackbar } from 'react-native-paper';

const SnackbarContext = createContext({
  showSnackbar: (message: string, duration?: number) => {},
});

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider: FC<PropsWithChildren> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [duration, setDuration] = useState(3000);

  const showSnackbar = (msg: string, dur: number = 3000) => {
    setMessage(msg);
    setDuration(dur);
    setVisible(true);
  };

  const onDismiss = () => {
    setVisible(false);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={onDismiss}
        duration={duration}
        action={{
          label: 'OK',
          onPress: () => {
            setVisible(false);
          },
        }}
      >
        {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
