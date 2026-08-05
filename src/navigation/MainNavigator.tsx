import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DashboardScreen } from '@/screens/Dashboard/DashboardScreen';
import { AddTransactionScreen } from '@/screens/Transactions/AddTransactionScreen';
import { TransactionsScreen } from '@/screens/Transactions/TransactionsScreen';
import { CategoriesScreen } from '@/screens/Categories/CategoriesScreen';
import { CategoryFormScreen } from '@/screens/Categories/CategoryFormScreen';
import { BudgetScreen } from '@/screens/Budget/BudgetScreen';
import { BudgetFormScreen } from '@/screens/Budget/BudgetFormScreen';
import { ReportsScreen } from '@/screens/Reports/ReportsScreen';
import { ProfileScreen } from '@/screens/Profile/ProfileScreen';
import { EditProfileScreen } from '@/screens/Profile/EditProfileScreen';
import { SettingsScreen } from '@/screens/Settings/SettingsScreen';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  BudgetStackParamList,
  DashboardStackParamList,
  MainTabParamList,
  ProfileStackParamList,
  ReportsStackParamList,
  TransactionsStackParamList,
} from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';

const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const TransactionsStack = createNativeStackNavigator<TransactionsStackParamList>();
const BudgetStack = createNativeStackNavigator<BudgetStackParamList>();
const ReportsStack = createNativeStackNavigator<ReportsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const DashboardNavigator = () => (
  <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
    <DashboardStack.Screen name="Dashboard" component={DashboardScreen} />
    <DashboardStack.Screen name="AddTransaction" component={AddTransactionScreen} />
    <DashboardStack.Screen name="Categories" component={CategoriesScreen} />
    <DashboardStack.Screen name="CategoryForm" component={CategoryFormScreen} />
  </DashboardStack.Navigator>
);

const TransactionsNavigator = () => (
  <TransactionsStack.Navigator screenOptions={{ headerShown: false }}>
    <TransactionsStack.Screen name="Transactions" component={TransactionsScreen} />
    <TransactionsStack.Screen name="AddTransaction" component={AddTransactionScreen} />
  </TransactionsStack.Navigator>
);

const BudgetNavigator = () => (
  <BudgetStack.Navigator screenOptions={{ headerShown: false }}>
    <BudgetStack.Screen name="Budget" component={BudgetScreen} />
    <BudgetStack.Screen name="BudgetForm" component={BudgetFormScreen} />
  </BudgetStack.Navigator>
);

const ReportsNavigator = () => (
  <ReportsStack.Navigator screenOptions={{ headerShown: false }}>
    <ReportsStack.Screen name="Reports" component={ReportsScreen} />
  </ReportsStack.Navigator>
);

const ProfileNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
  </ProfileStack.Navigator>
);

export const MainNavigator = () => {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            height: 64,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarIcon: ({ color, size }) => {
            const map: Record<string, string> = {
              DashboardTab: 'view-dashboard',
              TransactionsTab: 'swap-horizontal',
              BudgetTab: 'chart-arc',
              ReportsTab: 'chart-bar',
              ProfileTab: 'account-circle',
            };
            return <Icon name={map[route.name] ?? 'circle'} size={size} color={color} />;
          },
        })}>
        <Tab.Screen
          name="DashboardTab"
          component={DashboardNavigator}
          options={{ title: 'Home' }}
        />
        <Tab.Screen
          name="TransactionsTab"
          component={TransactionsNavigator}
          options={{ title: 'Transactions' }}
        />
        <Tab.Screen
          name="BudgetTab"
          component={BudgetNavigator}
          options={{ title: 'Budget' }}
        />
        <Tab.Screen
          name="ReportsTab"
          component={ReportsNavigator}
          options={{ title: 'Reports' }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileNavigator}
          options={{ title: 'Profile' }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};
