import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Chip, Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useForm} from 'react-hook-form';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FormTextField, GradientHeader, PrimaryButton} from '@/components';
import {CURRENCIES} from '@/constants';
import {useAppTheme} from '@/hooks/useAppTheme';
import {useAppDispatch, useAppSelector} from '@/redux/hooks';
import {updateProfile} from '@/redux/slices/profileSlice';
import {updateSettings} from '@/redux/slices/settingsSlice';
import {ProfileStackParamList} from '@/types';
import {validators} from '@/utils/validation';
import {toast} from '@/services/toast';
import {spacing} from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC<Props> = ({navigation}) => {
  const {colors} = useAppTheme();
  const dispatch = useAppDispatch();
  const uid = useAppSelector(s => s.auth.firebaseUid)!;
  const profile = useAppSelector(s => s.profile.data);
  const saving = useAppSelector(s => s.profile.saving);
  const [currency, setCurrency] = useState(profile?.currency ?? 'INR');

  const {
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<{name: string}>({
    defaultValues: {name: profile?.name ?? ''},
  });

  useEffect(() => {
    if (profile) {
      reset({name: profile.name});
      setCurrency(profile.currency);
    }
  }, [profile]);

  const onSubmit = handleSubmit(async values => {
    const result = await dispatch(
      updateProfile({
        uid,
        existingPhoto: null,
        values: {
          name: values.name,
          currency,
          photo: null,
        },
      }),
    );
    if (updateProfile.fulfilled.match(result)) {
      dispatch(updateSettings({currency}));
      toast.success('Profile updated');
      navigation.goBack();
    } else {
      toast.error('Update failed', result.payload as string);
    }
  });

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <GradientHeader title="Edit Profile" compact showBack={true} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, {backgroundColor: colors.primaryContainer}]}>
            <Icon name="account" size={48} color={colors.primary} />
          </View>
        </View>

        <FormTextField
          control={control}
          name="name"
          label="Name"
          autoCapitalize="words"
          error={errors.name?.message}
          rules={{validate: validators.required('Name is required')}}
        />

        <Text style={[styles.label, {color: colors.text}]}>Currency</Text>
        <View style={styles.chips}>
          {CURRENCIES.map(c => (
            <Chip
              key={c.code}
              selected={currency === c.code}
              onPress={() => setCurrency(c.code)}
              style={{marginRight: 8, marginBottom: 8}}>
              {c.code} ({c.symbol})
            </Chip>
          ))}
        </View>

        <PrimaryButton label="Save changes" onPress={onSubmit} loading={saving} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {padding: spacing.md},
  avatarWrap: {alignItems: 'center', marginBottom: spacing.lg},
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {fontWeight: '700', marginBottom: spacing.sm},
  chips: {flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md},
});
