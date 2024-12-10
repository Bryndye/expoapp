import { Image, StyleSheet, Platform, View, TouchableOpacity} from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  Accelerometer,
  Barometer,
  DeviceMotion,
  Gyroscope,
  LightSensor,
  Magnetometer,
  MagnetometerUncalibrated,
  Pedometer,
} from 'expo-sensors';
import { useRouter } from 'expo-router';
import styles from '@/components/Style';
export default function HomeScreen() {
  DeviceMotion.addListener((data) => {
      // console.log(data);
    }
  );
  const router = useRouter();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F3F7FF', dark: '#F3F7FF' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
        <TouchableOpacity style={[styles.widgetArea, styles.widgetSession]} onPress={() => router.push('/explore')}
          >
            <View style={[styles.widgetSessionColumn, styles.widgetSessionIcon]}>
              <HelloWave />
            </View>

            <View style={styles.widgetSessionColumn}>
              <ThemedText>Current Jogging</ThemedText>
              <ThemedText>01:01:01</ThemedText>
            </View>

            <View style={styles.widgetSessionColumn}>
              <ThemedText>10.9 km</ThemedText>
              <ThemedText>540 kcal</ThemedText>
            </View>
        </TouchableOpacity>

        <ThemedView style={styles.widgetArea}>
          <ThemedText type="subtitle">Step 1: Try it</ThemedText>
          <ThemedText>
            Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
            Press{' '}
            <ThemedText type="defaultSemiBold">
              {Platform.select({
                ios: 'cmd + d',
                android: 'cmd + m',
                web: 'F12'
              })}
            </ThemedText>{' '}
            to open developer tools.
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.widgetArea}>
          <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          <ThemedText>
            Tap the Explore tab to learn more about what's included in this starter app.
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.widgetArea}>
          <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
          <ThemedText>
            When you're ready, run{' '}
            <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
            <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
            <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
            <ThemedText type="defaultSemiBold">app-example</ThemedText>.
          </ThemedText>
        </ThemedView>

    </ParallaxScrollView>
  );
}