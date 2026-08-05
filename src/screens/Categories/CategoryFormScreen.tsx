import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Chip, SegmentedButtons, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useForm } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormTextField, GradientHeader, PrimaryButton } from '@/components';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/constants';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { saveCategory } from '@/redux/slices/categoriesSlice';
import { DashboardStackParamList, TransactionType } from '@/types';
import { validators } from '@/utils/validation';
import { toast } from '@/services/toast';
import { spacing } from '@/theme';

import { authApi } from '@/firebase';

type Props = NativeStackScreenProps<DashboardStackParamList, 'CategoryForm'>;

export const CategoryFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const authState = useAppSelector(s => s.auth);
  const uid = authState.firebaseUid || authState.user?.uid || authApi.currentUser()?.uid;
  const saving = useAppSelector(s => s.categories.saving);
  const existing = useAppSelector(s =>
    s.categories.items.find(c => c.id === route.params?.categoryId),
  );

  const [type, setType] = useState<TransactionType>(existing?.type ?? 'expense');
  const [icon, setIcon] = useState(existing?.icon ?? CATEGORY_ICONS[0]!);
  const [color, setColor] = useState(existing?.color ?? CATEGORY_COLORS[0]!);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ name: string }>({
    defaultValues: { name: existing?.name ?? '' },
  });

  useEffect(() => {
    if (existing) {
      reset({ name: existing.name });
    }
  }, [existing, reset]);

  const onSubmit = handleSubmit(async values => {
    if (!uid) {
      toast.error('Save failed', 'User session not found. Please log in again.');
      return;
    }
    const result = await dispatch(
      saveCategory({
        uid,
        categoryId: existing?.id,
        values: { name: values.name.trim(), icon, color, type },
      }),
    );
    if (saveCategory.fulfilled.match(result)) {
      toast.success(existing ? 'Category updated' : 'Category created');
      navigation.goBack();
    } else {
      toast.error('Save failed', (result.payload as string) ?? 'Failed to save category');
    }
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <GradientHeader
        title={existing ? 'Edit Category' : 'New Category'}
        compact
        showBack={true}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <SegmentedButtons
          value={type}
          onValueChange={v => setType(v as TransactionType)}
          buttons={[
            { value: 'expense', label: 'Expense' },
            { value: 'income', label: 'Income' },
          ]}
          style={{ marginBottom: spacing.md }}
        />
        <FormTextField
          control={control}
          name="name"
          label="Category name"
          autoCapitalize="words"
          error={errors.name?.message}
          rules={{ validate: validators.required('Name is required') }}
        />

        <Text style={[styles.label, { color: colors.text }]}>Icon</Text>
        <View style={styles.grid}>
          {CATEGORY_ICONS.map(item => (
            <Pressable
              key={item}
              onPress={() => setIcon(item)}
              style={[
                styles.iconCell,
                {
                  backgroundColor: icon === item ? `${color}33` : colors.surface,
                  borderColor: icon === item ? color : colors.border,
                },
              ]}>
              <Icon name={item} size={22} color={icon === item ? color : colors.textSecondary} />
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Color</Text>
        <View style={styles.grid}>
          {CATEGORY_COLORS.map(c => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={[
                styles.colorCell,
                { backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: colors.text },
              ]}
            />
          ))}
        </View>

        <Chip icon={icon} style={{ alignSelf: 'flex-start', backgroundColor: `${color}22` }}>
          Preview
        </Chip>

        <PrimaryButton
          label={existing ? 'Update' : 'Create'}
          onPress={onSubmit}
          loading={saving}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  label: { fontWeight: '700', marginVertical: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  iconCell: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  colorCell: { width: 36, height: 36, borderRadius: 12 },
});