import React, {useEffect} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useForm} from 'react-hook-form';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FormTextField, GradientHeader, PrimaryButton} from '@/components';
import {useAppTheme} from '@/hooks/useAppTheme';
import {useAppDispatch, useAppSelector} from '@/redux/hooks';
import {clearAuthError, registerUser} from '@/redux/slices/authSlice';
import {AuthStackParamList} from '@/types';
import {validators} from '@/utils/validation';
import {toast} from '@/services/toast';
import {spacing} from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

type Form = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const RegisterScreen: React.FC<Props> = ({navigation}) => {
  const {colors} = useAppTheme();
  const dispatch = useAppDispatch();
  const {loading, error} = useAppSelector(s => s.auth);

  const {
    control,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm<Form>({
    defaultValues: {name: '', email: '', password: '', confirmPassword: ''},
  });

  useEffect(() => {
    if (error) {
      toast.error('Registration failed', error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const onSubmit = handleSubmit(async values => {
    const result = await dispatch(
      registerUser({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      }),
    );
    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created', 'Welcome to Track');
    }
  });

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: colors.background}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <GradientHeader title="Create account" subtitle="Start tracking in minutes" compact showBack={true} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <FormTextField
          control={control}
          name="name"
          label="Full name"
          autoCapitalize="words"
          error={errors.name?.message}
          rules={{validate: validators.required('Name is required')}}
        />
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
        <FormTextField
          control={control}
          name="password"
          label="Password"
          secureTextEntry
          error={errors.password?.message}
          rules={{
            validate: v => {
              const required = validators.required()(v);
              return required === true ? validators.password()(v) : required;
            },
          }}
        />
        <FormTextField
          control={control}
          name="confirmPassword"
          label="Confirm password"
          secureTextEntry
          error={errors.confirmPassword?.message}
          rules={{
            validate: v => validators.match(watch('password'))(v),
          }}
        />

        <PrimaryButton label="Register" onPress={onSubmit} loading={loading} />

        <Text style={[styles.footer, {color: colors.textSecondary}]}>
          Already have an account?{' '}
          <Text
            style={{color: colors.primary, fontWeight: '700'}}
            onPress={() => navigation.navigate('Login')}>
            Login
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  content: {padding: spacing.lg},
  footer: {textAlign: 'center', marginTop: spacing.lg},
});
