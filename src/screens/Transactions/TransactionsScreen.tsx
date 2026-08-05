import React, {useMemo, useState} from 'react';
import {Alert, FlatList, StyleSheet, View} from 'react-native';
import {Chip, FAB, Menu, Searchbar, Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  EmptyState,
  GradientHeader,
  TransactionItem,
} from '@/components';
import {PAYMENT_METHODS} from '@/constants';
import {useAppTheme} from '@/hooks/useAppTheme';
import {useCategoryMap} from '@/hooks/useAppBootstrap';
import {useAppDispatch, useAppSelector} from '@/redux/hooks';
import {
  removeTransaction,
  resetFilters,
  setFilters,
} from '@/redux/slices/transactionsSlice';
import {DateFilterPreset, TransactionsStackParamList} from '@/types';
import {filterTransactions} from '@/utils/format';
import {toast} from '@/services/toast';
import {spacing} from '@/theme';

type Props = NativeStackScreenProps<TransactionsStackParamList, 'Transactions'>;

const DATE_PRESETS: {value: DateFilterPreset; label: string}[] = [
  {value: 'all', label: 'All'},
  {value: 'today', label: 'Today'},
  {value: 'yesterday', label: 'Yesterday'},
  {value: 'this_week', label: 'This Week'},
  {value: 'this_month', label: 'This Month'},
];

export const TransactionsScreen: React.FC<Props> = ({navigation}) => {
  const {colors} = useAppTheme();
  const dispatch = useAppDispatch();
  const {items, filters} = useAppSelector(s => s.transactions);
  const currency = useAppSelector(s => s.profile.data?.currency ?? s.settings.currency);
  const categories = useAppSelector(s => s.categories.items);
  const categoryMap = useCategoryMap();
  const [menuVisible, setMenuVisible] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const filtered = useMemo(() => filterTransactions(items, filters), [items, filters]);
  const paged = filtered.slice(0, page * pageSize);

  const confirmDelete = (id: string) => {
    Alert.alert('Delete transaction', 'This cannot be undone.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await dispatch(removeTransaction(id));
          toast.success('Transaction deleted');
        },
      },
    ]);
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <GradientHeader title="Transactions" subtitle={`${filtered.length} results`} compact showBack={false} />
      <View style={styles.content}>
        <Searchbar
          placeholder="Search description, amount…"
          value={filters.search}
          onChangeText={text => {
            dispatch(setFilters({search: text}));
            setPage(1);
          }}
          style={{backgroundColor: colors.surface, marginBottom: spacing.sm}}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={DATE_PRESETS}
          keyExtractor={i => i.value}
          style={{maxHeight: 44, marginBottom: spacing.sm}}
          renderItem={({item}) => (
            <Chip
              selected={filters.datePreset === item.value}
              onPress={() => {
                dispatch(setFilters({datePreset: item.value}));
                setPage(1);
              }}
              style={{marginRight: 8}}>
              {item.label}
            </Chip>
          )}
        />

        <View style={styles.filterRow}>
          {(['all', 'income', 'expense'] as const).map(type => (
            <Chip
              key={type}
              selected={filters.type === type}
              onPress={() => {
                dispatch(setFilters({type}));
                setPage(1);
              }}
              style={{marginRight: 8}}>
              {type}
            </Chip>
          ))}
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Chip icon="filter-variant" onPress={() => setMenuVisible(true)}>
                More
              </Chip>
            }>
            <Menu.Item
              onPress={() => {
                dispatch(
                  setFilters({
                    sortBy: 'date',
                    sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc',
                  }),
                );
                setMenuVisible(false);
              }}
              title="Sort by date"
            />
            <Menu.Item
              onPress={() => {
                dispatch(
                  setFilters({
                    sortBy: 'amount',
                    sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc',
                  }),
                );
                setMenuVisible(false);
              }}
              title="Sort by amount"
            />
            {PAYMENT_METHODS.map(pm => (
              <Menu.Item
                key={pm.value}
                onPress={() => {
                  dispatch(
                    setFilters({
                      paymentMethod:
                        filters.paymentMethod === pm.value ? null : pm.value,
                    }),
                  );
                  setMenuVisible(false);
                }}
                title={pm.label}
              />
            ))}
            {categories.map(cat => (
              <Menu.Item
                key={cat.id}
                onPress={() => {
                  dispatch(
                    setFilters({
                      categoryId: filters.categoryId === cat.id ? null : cat.id,
                    }),
                  );
                  setMenuVisible(false);
                }}
                title={cat.name}
              />
            ))}
            <Menu.Item
              onPress={() => {
                dispatch(resetFilters());
                setMenuVisible(false);
                setPage(1);
              }}
              title="Reset filters"
            />
          </Menu>
        </View>

        <FlatList
          data={paged}
          keyExtractor={item => item.id}
          contentContainerStyle={{paddingBottom: 100}}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="No transactions found"
              subtitle="Try adjusting filters or add a new entry"
              icon="magnify"
            />
          }
          onEndReached={() => {
            if (paged.length < filtered.length) {
              setPage(p => p + 1);
            }
          }}
          onEndReachedThreshold={0.4}
          renderItem={({item}) => (
            <TransactionItem
              transaction={item}
              category={categoryMap.get(item.categoryId)}
              currency={currency}
              onPress={() =>
                navigation.navigate('AddTransaction', {transactionId: item.id})
              }
              onLongPress={() => confirmDelete(item.id)}
            />
          )}
          ListFooterComponent={
            paged.length < filtered.length ? (
              <Text style={{textAlign: 'center', color: colors.textSecondary}}>
                Loading more…
              </Text>
            ) : null
          }
        />
      </View>

      <FAB
        icon="plus"
        style={[styles.fab, {backgroundColor: colors.primary}]}
        color="#FFF"
        onPress={() => navigation.navigate('AddTransaction')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  content: {flex: 1, padding: spacing.md},
  filterRow: {flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, flexWrap: 'wrap'},
  fab: {position: 'absolute', right: 20, bottom: 24, borderRadius: 18},
});
