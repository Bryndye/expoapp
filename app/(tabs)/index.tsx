import { Image, StyleSheet, Platform, View, TouchableOpacity} from 'react-native';
import { useEffect, useState } from 'react';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import styles from '@/components/Style';
export default function HomeScreen() {
  const router = useRouter();

  const [runData, setRunData] = useState<any[]>([]);

  const geData = async () => {
    const storedData = await AsyncStorage.getItem('runData');
    if (storedData) {
      setRunData(JSON.parse(storedData));
    }
  }
  useEffect(() => {
    geData();
  }
  , []);

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
              <ThemedText style={{color:'#F3F7FF'}}>Current Jogging</ThemedText>
              <ThemedText style={{color:'#F3F7FF'}}>01:01:01</ThemedText>
            </View>

            <View style={styles.widgetSessionColumn}>
              <ThemedText style={{color:'#F3F7FF'}}>10.9 km</ThemedText>
              <ThemedText style={{color:'#F3F7FF'}}>540 kcal</ThemedText>
            </View>
        </TouchableOpacity>

        {/* Header activities */}
        <View style={{display:'flex', flexDirection:'row', justifyContent:'space-between', width:'100%'}}>
          <ThemedText style={{maxWidth:'50%'}}>
            Recent Activity
          </ThemedText> 

          <ThemedText style={{maxWidth:'50%'}}>
            All
          </ThemedText> 
        </View>

        <ThemedView style={styles.widgetArea}>
          {runData && (
            runData.map((run: any, index: number) => (
              <View key={index} style={styles.contentRunData}>
                <View style={{height:'100%', maxWidth:'50%', display:'flex', flexDirection:'row', gap:'14'}}>
                  <View style={styles.mapRunData}>BLOC</View>
                  <View style={{height:'100%',maxWidth:'40%', display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
                    <ThemedText >{run['date'] ?? 'No date'}</ThemedText>
                    <ThemedText type='bold' >{run['distance']} km</ThemedText>
                    <View style={{ width: '100%',display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                      <ThemedText >{run['calories'] ?? 0} kcal</ThemedText>
                      <ThemedText >{run['speed']} km/h</ThemedText>
                    </View>
                  </View>
                </View>
                <ThemedText type='bold' >{'>'}</ThemedText>
              </View>
            ))
            )
          }
        </ThemedView>

    </ParallaxScrollView>
  );
}