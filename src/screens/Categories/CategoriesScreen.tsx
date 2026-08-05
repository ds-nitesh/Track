import React, {useMemo} from 'react';
import {Alert, FlatList, Pressable, StyleSheet, View} from 'react-native';
import {FAB, Searchbar, Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {EmptyState, GradientHeader} from '@/components';
import {useAppTheme} from '@/hooks/useAppTheme';
import {useAppDispatch, useAppSelector} from '@/redux/hooks';
import {
  removeCategory,
  setCategorySearch,
} from '@/redux/slices/categoriesSlice';
import {DashboardStackParamList} from '@/types';
import {toast} from '@/services/toast';
import {spacing} from '@/theme';

type Props = NativeStackScreenProps<DashboardStackParamList, 'Categories'>;

export const CategoriesScreen: React.FC<Props> = ({navigation}) => {
  const {colors} = useAppTheme();
  const dispatch = useAppDispatch();
  const {items, search} = useAppSelector(s => s.categories);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(c => c.name.toLowerCase().includes(q));
  }, [items, search]);

  const onDelete = (id: string, name: string) => {
    Alert.alert('Delete category', `Remove “${name}”?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await dispatch(removeCategory(id));
          toast.success('Category deleted');
        },
      },
    ]);
  };

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <GradientHeader title="Categories" subtitle="Organize income & expenses" compact showBack={true} />
      <View style={styles.content}>
        <Searchbar
          placeholder="Search categories"
          value={search}
          onChangeText={text => dispatch(setCategorySearch(text))}
          style={{backgroundColor: colors.surface, marginBottom: spacing.md}}
        />
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{paddingBottom: 100}}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState title="No categories" subtitle="Add your first category" />
          }
          renderItem={({item}) => (
            <Pressable
              onPress={() => navigation.navigate('CategoryForm', {categoryId: item.id})}
              onLongPress={() => onDelete(item.id, item.name)}
              style={[styles.row, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <View style={[styles.icon, {backgroundColor: `${item.color}22`}]}>
                <Icon name={item.icon} size={22} color={item.color} />
              </View>
              <View style={{flex: 1}}>
                <Text style={{color: colors.text, fontWeight: '700'}}>{item.name}</Text>
                <Text style={{color: colors.textSecondary, textTransform: 'capitalize'}}>
                  {item.type}
                </Text>
              </View>
              <Icon name="chevron-right" size={22} color={colors.textSecondary} />
            </Pressable>
          )}
        />
      </View>
      <FAB
        icon="plus"
        style={[styles.fab, {backgroundColor: colors.primary}]}
        color="#FFF"
        onPress={() => navigation.navigate('CategoryForm')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  content: {flex: 1, padding: spacing.md},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  fab: {position: 'absolute', right: 20, bottom: 24, borderRadius: 18},
});
