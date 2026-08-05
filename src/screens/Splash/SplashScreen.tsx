import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {APP_NAME, APP_TAGLINE} from '@/constants';
import {useAppTheme} from '@/hooks/useAppTheme';
import {RootStackParamList} from '@/types';
import {typography} from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = () => {
  const {colors} = useAppTheme();
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.container}>
      <Animated.View style={{opacity, transform: [{scale}], alignItems: 'center'}}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>₹</Text>
        </View>
        <Text style={[typography.hero, {color: '#FFF', marginTop: 20}]}>{APP_NAME}</Text>
        <Text style={{color: 'rgba(255,255,255,0.85)', marginTop: 8}}>{APP_TAGLINE}</Text>
      </Animated.View>
      <ActivityIndicator color="#FFF" style={{marginTop: 48}} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '800',
  },
});
