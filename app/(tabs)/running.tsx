import { View, TouchableOpacity, Alert} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { ThemedText } from '@/components/ThemedText';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import styles from '@/components/Style';
import MapView, { Polyline, Marker, LatLng } from 'react-native-maps';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlay, faPause, faRunning, faFire, faBolt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function RunningScreen() {
  //#region Variables
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | any>(null);
  const [path, setPath] = useState<LatLng[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [marker, setMarker] = useState<LatLng>();
  // Stats
  const [time, setTime] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [calories, setCalories] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  //#endregion

  //#region Functions
  useEffect(() => {
    permissions();
    const initLocation = async () => {
      await getLocation();
    };
    initLocation();
  },[]);

  const permissions = async () => {
    let { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      setErrorMsg('Permission to access location was denied.');
      Alert.alert('Erreur', 'Permission to access location was denied.');
      return;
    }
  
    let { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      setErrorMsg('Permission to access background location was denied.');
      Alert.alert('Erreur', 'Permission to access background location was denied.');
      return;
    }
  }

  const getLocation = async () => {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  
    setLocation(loc);
    console.log('Location: ', loc);
    const { latitude, longitude } = loc.coords;
  
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  
    setMarker({ latitude, longitude });
  };  

  // Calculer la distance entre deux points GPS
  function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Rayon de la Terre en mètres
    const toRad = (angle: number) => (angle * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Résultat en mètres
  }

  const updateLocationAndStats = async () => {
    try {
      await getLocation();
      const { latitude, longitude } = location.coords;

      if (path.length > 0) {
        const lastPoint = path[path.length - 1];
        const newDistance = haversine(
          lastPoint.latitude,
          lastPoint.longitude,
          latitude,
          longitude
        );
        
        setDistance((prev) => prev + parseFloat((newDistance / 1000).toFixed(2))); // Convertir en Km
        console.log('Distance: ', distance);
        setSpeed((newDistance / 1000) / (time / 3600)); // Km/hr
      }

      setPath((prev) => [...prev, { latitude, longitude }]);
    } catch (err) {
      console.error(err);
    }
  };
  //#endregion

  //#region UseEffects
  // Démarrer le podomètre
  useEffect(() => {
    getLocation();
  }, []);

  // Centrer la carte sur la position actuelle
  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateCamera({
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        zoom: 15,
      });
    }
  }, [location]);

  // Timer
  useEffect(() => {    
    let interval: NodeJS.Timeout;
    let interval2: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);

      interval2 = setInterval(updateLocationAndStats, 3000);
    }
    else {
      // Reset stats
      // Récupérer les données et les enregistrer
    }
    return () => {
      clearInterval(interval);
      clearInterval(interval2)
    }; // Nettoyage à l'arrêt
  }, [isRunning]);
  //#endregion

  return (
      <View style={[styles.runningScreen]}>
          <MapView
              style={styles.runningMap}
              ref={mapRef}
              initialRegion={
                location
                  ? {
                      latitude: location.coords.latitude,
                      longitude: location.coords.longitude,
                      latitudeDelta: 0.0122,
                      longitudeDelta: 0.0051,
                    }
                  : {
                      latitude: 0, // Valeur par défaut pour éviter un crash
                      longitude: 0,
                      latitudeDelta: 0.1,
                      longitudeDelta: 0.1,
                    }
                }
              showsUserLocation={true}
              zoomEnabled={true}
            >
              {
                marker && <Marker id={marker.latitude.toString()} coordinate={{ latitude: marker.latitude, longitude: marker.longitude }} />
              }
              <Polyline coordinates={path} strokeColor="blue" strokeWidth={4} />
          </MapView>
          
          {/* Header */}
          <View style={{padding:32, width:'100%'}}>
            <View style={styles.runningHeader}>
                <TouchableOpacity style={[styles.widgetArea, styles.button]} onPress={() => router.push('/explore')}>
                  <FontAwesomeIcon icon={faArrowLeft} size={24} color={'white'} />
                </TouchableOpacity>
                <ThemedText>Current Jogging</ThemedText>
                <ThemedText>GPS on</ThemedText>
            </View>
          </View>

          {/* Data */}
          <View style={{padding:32, width:'100%'}}>
            <View style={[styles.widgetArea, styles.runningData, {zIndex:100, height: 180}]}>
                <View style={styles.runningDataPart}> 
                  <View style={[styles.runningDataHeaderLeft]}>
                    <ThemedText type='subtitle'>Running  Time</ThemedText>
                    <ThemedText type='light'>{new Date(time * 1000).toISOString().substr(11, 8)} {/* Format HH:MM:SS */}</ThemedText>
                  </View>
                            
                  <TouchableOpacity style={[styles.button]} onPress={() => setIsRunning(!isRunning)}>
                      <FontAwesomeIcon icon={isRunning ? faPause : faPlay} size={32} color={'white'} />
                  </TouchableOpacity>
                </View>

                <View style={[styles.runningDataPart, styles.runningDataBottom]}>
                  <View style={[styles.runningDataCol, styles.runningBorderRight]}>
                      <FontAwesomeIcon icon={faRunning} size={24} />
                      <View style={styles.runningDataColitem}>
                        <ThemedText type='subtitle'>{distance}</ThemedText>
                        <ThemedText type='defaultSemiBold'>Km</ThemedText>
                      </View>
                  </View>

                  <View style={[styles.runningDataCol, styles.runningBorderRight]}>
                      <FontAwesomeIcon icon={faFire} size={24} />
                      <View style={styles.runningDataColitem}>
                        <ThemedText type='subtitle'>{calories}</ThemedText>
                        <ThemedText type='defaultSemiBold'>Kcal</ThemedText>
                      </View>
                  </View>

                  <View style={styles.runningDataCol}>
                      <FontAwesomeIcon icon={faBolt} size={24} />
                      <View style={styles.runningDataColitem}>
                        <ThemedText type='subtitle'>{speed}</ThemedText>
                        <ThemedText type='defaultSemiBold'>Km/hr</ThemedText>
                      </View>
                  </View>
                </View>
            </View>
          </View>          
      </View>
  );
}