import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Chip, Text} from 'react-native-paper';
import {useForm} from 'react-hook-form';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FormTextField, GradientHeader, PrimaryButton} from '@/components';
import {useAppTheme} from '@/hooks/useAppTheme';
import {useAppDispatch, useAppSelector} from '@/redux/hooks';
import {saveBudget} from '@/redux/slices/budgetsSlice';
import {BudgetStackParamList} from '@/types';
import {validators} from '@/utils/validation';
import {toast} from '@/services/toast';
import {deleteBudgetConfirm} from './BudgetScreen';
import {spacing} from '@/theme';

import {authApi} from '@/firebase';

type Props = NativeStackScreenProps<BudgetStackParamList, 'BudgetForm'>;

export const BudgetFormScreen: React.FC<Props> = ({navigation, route}) => {
  const {colors} = useAppTheme();
  const dispatch = useAppDispatch();
  const authState = useAppSelector(s => s.auth);
  const uid = authState.firebaseUid || authState.user?.uid || authApi.currentUser()?.uid;
  const saving = useAppSelector(s => s.budgets.saving);
  const categories = useAppSelector(s =>
    s.categories.items.filter(c => c.type === 'expense'),
  );
  const existing = useAppSelector(s =>
    s.budgets.items.find(b => b.id === route.params?.budgetId),
  );

  const now = new Date();
  const [categoryId, setCategoryId] = useState<string | null>(
    existing?.categoryId ?? null,
  );
  const [month] = useState(existing?.month ?? now.getMonth() + 1);
  const [year] = useState(existing?.year ?? now.getFullYear());

  const {
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<{amount: string}>({
    defaultValues: {amount: existing ? String(existing.amount) : ''},
  });

  useEffect(() => {
    if (existing) {
      reset({amount: String(existing.amount)});
    }
  }, [existing, reset]);

  const onSubmit = handleSubmit(async values => {
    if (!uid) {
      toast.error('Save failed', 'User session not found. Please log in again.');
      return;
    }
    const result = await dispatch(
      saveBudget({
        uid,
        budgetId: existing?.id,
        values: {categoryId, amount: values.amount, month, year},
      }),
    );
    if (saveBudget.fulfilled.match(result)) {
      toast.success(existing ? 'Budget updated' : 'Budget created');
      navigation.goBack();
    } else {
      toast.error('Save failed', result.payload as string);
    }
  });

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <GradientHeader
        title={existing ? 'Edit Budget' : 'New Budget'}
        subtitle={`${month}/${year}`}
        compact
        showBack={true}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <FormTextField
          control={control}
          name="amount"
          label="Budget amount"
          keyboardType="numeric"
          error={errors.amount?.message}
          rules={{validate: validators.amount()}}
        />

        <Text style={[styles.label, {color: colors.text}]}>
          Category (optional — leave empty for overall)
        </Text>
        <View style={styles.chips}>
          <Chip
            selected={categoryId === null}
            onPress={() => setCategoryId(null)}
            style={{marginRight: 8, marginBottom: 8}}>
            Overall
          </Chip>
          {categories.map(cat => (
            <Chip
              key={cat.id}
              selected={categoryId === cat.id}
              onPress={() => setCategoryId(cat.id)}
              style={{marginRight: 8, marginBottom: 8}}>
              {cat.name}
            </Chip>
          ))}
        </View>

        <PrimaryButton
          label={existing ? 'Update Budget' : 'Save Budget'}
          onPress={onSubmit}
          loading={saving}
        />
        {existing ? (
          <PrimaryButton
            label="Delete Budget"
            mode="outlined"
            onPress={() => {
              deleteBudgetConfirm(dispatch, existing.id);
              navigation.goBack();
            }}
          />
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {padding: spacing.md},
  label: {fontWeight: '700', marginBottom: spacing.sm},
  chips: {flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md},
});
