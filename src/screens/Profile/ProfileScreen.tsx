import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {List, Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {GradientHeader, PrimaryButton} from '@/components';
import {useAppTheme} from '@/hooks/useAppTheme';
import {useAppDispatch, useAppSelector} from '@/redux/hooks';
import {logoutUser} from '@/redux/slices/authSlice';
import {ProfileStackParamList} from '@/types';
import {toast} from '@/services/toast';
import {spacing} from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({navigation}) => {
  const {colors} = useAppTheme();
  const dispatch = useAppDispatch();
  const profile = useAppSelector(s => s.profile.data);
  const authUser = useAppSelector(s => s.auth.user);
  const user = profile ?? authUser;

  const onLogout = async () => {
    await dispatch(logoutUser());
    toast.info('Logged out');
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <GradientHeader title="Profile" subtitle="Manage your account" compact showBack={false} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, {backgroundColor: colors.primaryContainer}]}>
            <Icon name="account" size={48} color={colors.primary} />
          </View>
          <Text style={[styles.name, {color: colors.text}]}>{user?.name ?? 'User'}</Text>
          <Text style={{color: colors.textSecondary}}>{user?.email}</Text>
          <Text style={{color: colors.textSecondary, marginTop: 4}}>
            Currency: {user?.currency ?? 'INR'}
          </Text>
        </View>

        <List.Section>
          <List.Item
            title="Edit Profile"
            left={props => <List.Icon {...props} icon="account-edit" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('EditProfile')}
            style={[styles.item, {backgroundColor: colors.card}]}
          />
          <List.Item
            title="Settings"
            left={props => <List.Icon {...props} icon="cog" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Settings')}
            style={[styles.item, {backgroundColor: colors.card}]}
          />
        </List.Section>

        <PrimaryButton label="Logout" mode="outlined" onPress={onLogout} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {padding: spacing.md},
  avatarWrap: {alignItems: 'center', marginVertical: spacing.lg},
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {fontSize: 22, fontWeight: '700', marginTop: spacing.sm},
  item: {borderRadius: 16, marginBottom: spacing.sm},
});
