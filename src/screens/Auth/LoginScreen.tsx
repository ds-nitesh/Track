import React, {useEffect} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View} from 'react-native';
import {Checkbox, Text} from 'react-native-paper';
import {useForm} from 'react-hook-form';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {FormTextField, PrimaryButton} from '@/components';
import {APP_NAME} from '@/constants';
import {useAppTheme} from '@/hooks/useAppTheme';
import {useAppDispatch, useAppSelector} from '@/redux/hooks';
import {clearAuthError, loginUser} from '@/redux/slices/authSlice';
import {AuthStackParamList} from '@/types';
import {preferenceStorage} from '@/utils/storage';
import {validators} from '@/utils/validation';
import {toast} from '@/services/toast';
import {spacing, typography} from '@/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

type Form = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export const LoginScreen: React.FC<Props> = ({navigation}) => {
  const {colors} = useAppTheme();
  const dispatch = useAppDispatch();
  const {loading, error} = useAppSelector(s => s.auth);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: {errors},
  } = useForm<Form>({
    defaultValues: {
      email: preferenceStorage.getRememberedEmail(),
      password: '',
      rememberMe: preferenceStorage.getRememberMe(),
    },
  });

  useEffect(() => {
    if (error) {
      toast.error('Login failed', error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const onSubmit = handleSubmit(async values => {
    const result = await dispatch(
      loginUser({
        email: values.email.trim(),
        password: values.password,
        rememberMe: values.rememberMe,
      }),
    );
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back', result.payload.name);
    }
  });

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: colors.background}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.hero}>
          <Text style={[typography.hero, {color: '#FFF'}]}>{APP_NAME}</Text>
          <Text style={{color: 'rgba(255,255,255,0.9)', marginTop: 6}}>
            Sign in to manage your money
          </Text>
        </LinearGradient>

        <View style={[styles.sheet, {backgroundColor: colors.background}]}>
          <FormTextField
            control={control}
            name="email"
            label="Email"
            keyboardType="email-address"
            error={errors.email?.message}
            rules={{
              validate: v => {
                const value = String(v ?? '');
                const required = validators.required()(value);
                if (required !== true) {
                  return required;
                }
                return validators.email()(value);
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
                const value = String(v ?? '');
                const required = validators.required()(value);
                if (required !== true) {
                  return required;
                }
                return validators.password()(value);
              },
            }}
          />

          <View style={styles.row}>
            <View style={styles.remember}>
              <Checkbox
                status={watch('rememberMe') ? 'checked' : 'unchecked'}
                onPress={() => setValue('rememberMe', !watch('rememberMe'))}
              />
              <Text style={{color: colors.text}}>Remember me</Text>
            </View>
            <Text
              style={{color: colors.primary, fontWeight: '600'}}
              onPress={() => navigation.navigate('ForgotPassword')}>
              Forgot password?
            </Text>
          </View>

          <PrimaryButton label="Login" onPress={onSubmit} loading={loading} />

          <Text style={[styles.footer, {color: colors.textSecondary}]}>
            Don’t have an account?{' '}
            <Text
              style={{color: colors.primary, fontWeight: '700'}}
              onPress={() => navigation.navigate('Register')}>
              Register
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: {flexGrow: 1},
  hero: {
    paddingTop: 80,
    paddingBottom: 48,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  sheet: {
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.lg,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  remember: {flexDirection: 'row', alignItems: 'center'},
  footer: {textAlign: 'center', marginTop: spacing.lg},
});
