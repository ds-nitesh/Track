import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, HelperText, TextInput} from 'react-native-paper';
import {
  Control,
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';
import {useAppTheme} from '@/hooks/useAppTheme';
import {spacing} from '@/theme';

type FieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  right?: React.ReactNode;
  multiline?: boolean;
  rules?: RegisterOptions<T, Path<T>>;
};

export function FormTextField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  right,
  multiline,
  rules,
}: FieldProps<T>) {
  const {colors} = useAppTheme();
  const [show, setShow] = React.useState(false);

  return (
    <View style={styles.field}>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            label={label}
            mode="outlined"
            value={value?.toString?.() ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry={secureTextEntry && !show}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            multiline={multiline}
            error={!!error}
            outlineStyle={{borderRadius: 14}}
            style={{backgroundColor: colors.surface}}
            right={
              secureTextEntry ? (
                <TextInput.Icon
                  icon={show ? 'eye-off' : 'eye'}
                  onPress={() => setShow(s => !s)}
                />
              ) : (
                (right as any)
              )
            }
          />
        )}
      />
      {error ? <HelperText type="error">{error}</HelperText> : null}
    </View>
  );
}

export const PrimaryButton: React.FC<{
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  mode?: 'contained' | 'outlined' | 'text';
}> = ({label, onPress, loading, disabled, mode = 'contained'}) => (
  <Button
    mode={mode}
    onPress={onPress}
    loading={loading}
    disabled={disabled || loading}
    style={styles.button}
    contentStyle={{paddingVertical: 6}}
    labelStyle={{fontWeight: '700'}}>
    {label}
  </Button>
);

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.sm,
  },
  button: {
    borderRadius: 14,
    marginTop: spacing.sm,
  },
});
