import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useForm} from 'react-hook-form';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FormTextField, GradientHeader, PrimaryButton} from '@/components';
import {useAppTheme} from '@/hooks/useAppTheme';
import {useAppDispatch, useAppSelector} from '@/redux/hooks';
import {clearAuthError, resetPassword} from '@/redux/slices/authSlice';
import {AuthStackParamList} from '@/types';
import {validators} from '@/utils/validation';
import {toast} from '@/services/toast';
import {spacing} from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({navigation}) => {
  const {colors} = useAppTheme();
  const dispatch = useAppDispatch();
  const {loading, error} = useAppSelector(s => s.auth);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<{email: string}>({defaultValues: {email: ''}});

  useEffect(() => {
    if (error) {
      toast.error('Reset failed', error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const onSubmit = handleSubmit(async values => {
    const result = await dispatch(resetPassword(values.email.trim()));
    if (resetPassword.fulfilled.match(result)) {
      toast.success('Email sent', 'Check your inbox for reset instructions');
      navigation.navigate('Login');
    }
  });

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <GradientHeader
        title="Forgot password"
        subtitle="We’ll email you a reset link"
        compact
        showBack={true}
      />
      <View style={styles.content}>
        <FormTextField
          control={control}
          name="email"
          label="Email"
          keyboardType="email-address"
          error={errors.email?.message}
          rules={{
            validate: v => {
              const required = validators.required()(v);
              return required === true ? validators.email()(v) : required;
            },
          }}
        />
        <PrimaryButton label="Send reset link" onPress={onSubmit} loading={loading} />
        <Text
          style={{color: colors.primary, textAlign: 'center', marginTop: spacing.lg}}
          onPress={() => navigation.goBack()}>
          Back to login
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {padding: spacing.lg},
});
