import React, {useEffect, useMemo, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {Chip, SegmentedButtons, Text} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useForm} from 'react-hook-form';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  FormTextField,
  GradientHeader,
  PrimaryButton,
} from '@/components';
import {PAYMENT_METHODS} from '@/constants';
import {useAppTheme} from '@/hooks/useAppTheme';
import {useAppDispatch, useAppSelector} from '@/redux/hooks';
import {saveTransaction} from '@/redux/slices/transactionsSlice';
import {DashboardStackParamList, PaymentMethod, TransactionType} from '@/types';
import {validators} from '@/utils/validation';
import {toast} from '@/services/toast';
import {spacing} from '@/theme';

import {authApi} from '@/firebase';

type Props = NativeStackScreenProps<DashboardStackParamList, 'AddTransaction'>;

type Form = {
  amount: string;
  description: string;
};

export const AddTransactionScreen: React.FC<Props> = ({navigation, route}) => {
  const {colors} = useAppTheme();
  const dispatch = useAppDispatch();
  const authState = useAppSelector(s => s.auth);
  const uid = authState.firebaseUid || authState.user?.uid || authApi.currentUser()?.uid;
  const saving = useAppSelector(s => s.transactions.saving);
  const categories = useAppSelector(s => s.categories.items);
  const existing = useAppSelector(s =>
    s.transactions.items.find(t => t.id === route.params?.transactionId),
  );

  const [type, setType] = useState<TransactionType>(existing?.type ?? 'expense');
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    existing?.paymentMethod ?? 'cash',
  );
  const [date, setDate] = useState(existing ? new Date(existing.date) : new Date());
  const [showDate, setShowDate] = useState(false);

  const filteredCategories = useMemo(
    () => categories.filter(c => c.type === type),
    [categories, type],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<Form>({
    defaultValues: {
      amount: existing ? String(existing.amount) : '',
      description: existing?.description ?? '',
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        amount: String(existing.amount),
        description: existing.description,
      });
      setType(existing.type);
      setCategoryId(existing.categoryId);
      setPaymentMethod(existing.paymentMethod);
      setDate(new Date(existing.date));
    }
  }, [existing]);

  useEffect(() => {
    if (!categoryId && filteredCategories[0]) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [filteredCategories, categoryId]);

  const onSubmit = handleSubmit(async values => {
    if (!uid) {
      toast.error('Save failed', 'User session not found. Please log in again.');
      return;
    }
    if (!categoryId) {
      toast.error('Select a category');
      return;
    }
    const result = await dispatch(
      saveTransaction({
        uid,
        transactionId: existing?.id,
        existingReceipt: null,
        values: {
          amount: values.amount,
          type,
          categoryId,
          paymentMethod,
          description: values.description,
          date,
          receiptImage: null,
        },
      }),
    );
    if (saveTransaction.fulfilled.match(result)) {
      toast.success(existing ? 'Transaction updated' : 'Transaction added');
      navigation.goBack();
    } else {
      toast.error('Save failed', result.payload as string);
    }
  });

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <GradientHeader
        title={existing ? 'Edit Transaction' : 'Add Transaction'}
        subtitle="Log income or expense"
        compact
        showBack={true}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <SegmentedButtons
          value={type}
          onValueChange={v => {
            setType(v as TransactionType);
            setCategoryId('');
          }}
          buttons={[
            {value: 'expense', label: 'Expense'},
            {value: 'income', label: 'Income'},
          ]}
          style={{marginBottom: spacing.md}}
        />

        <FormTextField
          control={control}
          name="amount"
          label="Amount"
          keyboardType="numeric"
          error={errors.amount?.message}
          rules={{validate: validators.amount()}}
        />
        <FormTextField
          control={control}
          name="description"
          label="Description"
          autoCapitalize="sentences"
          error={errors.description?.message}
        />

        <Text style={[styles.label, {color: colors.text}]}>Category</Text>
        <View style={styles.chips}>
          {filteredCategories.map(cat => {
            const isSelected = categoryId === cat.id;
            return (
              <Chip
                key={cat.id}
                selected={isSelected}
                showSelectedCheck
                onPress={() => setCategoryId(cat.id)}
                style={{
                  marginRight: 8,
                  marginBottom: 8,
                  backgroundColor: isSelected ? `${cat.color}33` : colors.surface,
                  borderColor: isSelected ? cat.color : colors.border,
                  borderWidth: 1,
                }}
                textStyle={{
                  color: isSelected ? cat.color : colors.text,
                  fontWeight: isSelected ? '700' : '400',
                }}>
                {cat.name}
              </Chip>
            );
          })}
        </View>

        <Text style={[styles.label, {color: colors.text}]}>Payment method</Text>
        <View style={styles.chips}>
          {PAYMENT_METHODS.map(pm => {
            const isSelected = paymentMethod === pm.value;
            return (
              <Chip
                key={pm.value}
                selected={isSelected}
                showSelectedCheck
                onPress={() => setPaymentMethod(pm.value)}
                style={{
                  marginRight: 8,
                  marginBottom: 8,
                  backgroundColor: isSelected ? `${colors.primary}25` : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: 1,
                }}
                textStyle={{
                  color: isSelected ? colors.primary : colors.text,
                  fontWeight: isSelected ? '700' : '400',
                }}
                icon={pm.icon}>
                {pm.label}
              </Chip>
            );
          })}
        </View>

        <Pressable
          onPress={() => setShowDate(true)}
          style={[styles.dateBtn, {borderColor: colors.border, backgroundColor: colors.surface}]}>
          <Text style={{color: colors.textSecondary}}>Date</Text>
          <Text style={{color: colors.text, fontWeight: '600'}}>{date.toDateString()}</Text>
        </Pressable>
        {showDate ? (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={(_, selected) => {
              setShowDate(false);
              if (selected) setDate(selected);
            }}
          />
        ) : null}

        <View style={{height: spacing.md}} />

        <PrimaryButton
          label={existing ? 'Update' : 'Save Transaction'}
          onPress={onSubmit}
          loading={saving}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {padding: spacing.md, paddingBottom: spacing.xxl},
  label: {fontWeight: '700', marginBottom: spacing.sm, marginTop: spacing.sm},
  chips: {flexDirection: 'row', flexWrap: 'wrap'},
  dateBtn: {
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
});
