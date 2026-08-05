import {useEffect, useMemo} from 'react';
import Toast from 'react-native-toast-message';
import {authApi, enableOfflinePersistence, firestoreApi, notificationApi} from '@/firebase';
import {useAppDispatch, useAppSelector} from '@/redux/hooks';
import {setAuthUser, setInitializing} from '@/redux/slices/authSlice';
import {setBudgets, setBudgetsLoading} from '@/redux/slices/budgetsSlice';
import {setCategories, setCategoriesLoading} from '@/redux/slices/categoriesSlice';
import {pushNotification, setPermissionGranted} from '@/redux/slices/notificationsSlice';
import {setProfile} from '@/redux/slices/profileSlice';
import {setTransactions, setTransactionsLoading} from '@/redux/slices/transactionsSlice';
import {UserProfile} from '@/types';

/** Bootstraps auth listener, offline persistence, and realtime data sync */
export const useAppBootstrap = () => {
  const dispatch = useAppDispatch();
  const uid = useAppSelector(s => s.auth.firebaseUid);
  const notificationsEnabled = useAppSelector(s => s.settings.notificationsEnabled);

  useEffect(() => {
    enableOfflinePersistence();
    const unsub = authApi.subscribe(async user => {
      try {
        if (!user) {
          dispatch(setAuthUser(null));
          dispatch(setProfile(null));
          return;
        }

        const profile = await firestoreApi.getUserProfile(user.uid);
        if (profile) {
          dispatch(setAuthUser(profile));
          dispatch(setProfile(profile));
          return;
        }

        // Recover gracefully if profile doc is missing.
        const fallbackProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName ?? 'User',
          email: user.email ?? '',
          currency: 'INR',
          photo: user.photoURL,
          createdAt: new Date().toISOString(),
        };
        await firestoreApi.createUserProfile(fallbackProfile);
        dispatch(setAuthUser(fallbackProfile));
        dispatch(setProfile(fallbackProfile));
      } catch (error) {
        console.warn('[Track] bootstrap auth sync failed', error);
        if (user) {
          const fallbackProfile: UserProfile = {
            uid: user.uid,
            name: user.displayName ?? 'User',
            email: user.email ?? '',
            currency: 'INR',
            photo: user.photoURL,
            createdAt: new Date().toISOString(),
          };
          dispatch(setAuthUser(fallbackProfile));
          dispatch(setProfile(fallbackProfile));
        }
        dispatch(setInitializing(false));
      }
    });
    return unsub;
  }, [dispatch]);

  useEffect(() => {
    if (!uid) {
      return;
    }

    dispatch(setTransactionsLoading(true));
    dispatch(setCategoriesLoading(true));
    dispatch(setBudgetsLoading(true));

    const unsubTx = firestoreApi.subscribeTransactions(uid, items => {
      dispatch(setTransactions(items));
    });
    const unsubCat = firestoreApi.subscribeCategories(uid, items => {
      dispatch(setCategories(items));
    });
    const unsubBudget = firestoreApi.subscribeBudgets(uid, items => {
      dispatch(setBudgets(items));
    });
    const unsubProfile = firestoreApi.subscribeUserProfile(uid, profile => {
      if (profile) {
        dispatch(setProfile(profile));
        dispatch(setAuthUser(profile));
      }
    });

    return () => {
      unsubTx();
      unsubCat();
      unsubBudget();
      unsubProfile();
    };
  }, [uid, dispatch]);

  useEffect(() => {
    if (!uid || !notificationsEnabled) {
      notificationApi.cleanup();
      return;
    }

    notificationApi
      .initialize(uid, payload => {
        dispatch(pushNotification(payload));
        Toast.show({
          type: 'info',
          text1: payload.title,
          text2: payload.body,
        });
      })
      .then(async () => {
        const granted = await notificationApi.requestPermission();
        dispatch(setPermissionGranted(granted));
      });

    return () => notificationApi.cleanup();
  }, [uid, notificationsEnabled, dispatch]);
};

export const useDashboardStats = () => {
  const transactions = useAppSelector(s => s.transactions.items);
  const budgets = useAppSelector(s => s.budgets.items);
  const currency = useAppSelector(s => s.profile.data?.currency ?? s.settings.currency);

  return useMemo(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const monthTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const monthlyIncome = monthTx
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const monthlyExpense = monthTx
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const balance =
      transactions
        .filter(t => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0) -
      transactions
        .filter(t => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);

    const monthBudgets = budgets.filter(b => b.month === month && b.year === year);
    const monthlyBudget = monthBudgets.reduce((s, b) => s + b.amount, 0);
    const remainingBudget = monthlyBudget - monthlyExpense;
    const budgetProgress =
      monthlyBudget > 0 ? Math.min(100, (monthlyExpense / monthlyBudget) * 100) : 0;

    return {
      balance,
      monthlyIncome,
      monthlyExpense,
      savings: monthlyIncome - monthlyExpense,
      monthlyBudget,
      remainingBudget,
      budgetProgress,
      currency,
      recent: [...transactions].slice(0, 5),
    };
  }, [transactions, budgets, currency]);
};

export const useCategoryMap = () => {
  const categories = useAppSelector(s => s.categories.items);
  return useMemo(() => {
    const map = new Map(categories.map(c => [c.id, c]));
    return map;
  }, [categories]);
};
