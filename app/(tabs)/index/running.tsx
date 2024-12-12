import { View, TouchableOpacity, Alert} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { ThemedText } from '@/components/ThemedText';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import styles from '@/components/Style';
import MapView, { Polyline, Marker, LatLng } from 'react-native-maps';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlay, faPause, faRunning, faFire, faBolt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RunningScreen() {
  //#region Variables
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [location, setLocation] = useState<Location.LocationObject | any>(null);
  const [startLocation, setStartLocation] = useState<Location.LocationObject | any>(null);
  const [path, setPath] = useState<LatLng[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [markerEnd, setMarkerEnd] = useState<LatLng>();
  const [markerStart, setMarkerStart] = useState<LatLng>();
  // Stats
  const [time, setTime] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [calories, setCalories] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  //#endregion

  //#region Functions
  const permissions = async () => {
    let { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    setHasPermission(false);
    if (foregroundStatus !== 'granted') {
      Alert.alert('Erreur', 'Permission to access location was denied.');
      return;
    }
  
    let { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      Alert.alert('Erreur', 'Permission to access background location was denied.');
      return;
    }

    setHasPermission(true);
  }

  const getLocation = async () => {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  
    setLocation(loc);
    setStartLocation(loc);
    setMarkerStart({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
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
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = loc.coords;
  
      if (path.length > 0) {
        const lastPoint = path[path.length - 1];
        const newDistance = haversine(
          lastPoint.latitude,
          lastPoint.longitude,
          latitude,
          longitude
        );
  
        // Ajout de la nouvelle distance à la distance totale
        console.log(`Distance (m): ${parseFloat((newDistance / 1000).toFixed(2))}`);
        setDistance((prev) => prev + parseFloat((newDistance / 1000).toFixed(2))); // Convertir en Km
        console.log(`Distance (m): ${newDistance}, Total (km): ${distance/1000}`);
  
        // Calculer la vitesse en Km/h
        if (time > 0) {
          setSpeed(
            parseFloat(
            (((distance + newDistance / 1000) / time) * 3600).toFixed(2)
          )
          );
        }
      }
  
      // Ajouter le nouveau point au chemin
      setPath((prev) => [...prev, { latitude, longitude }]);
      setMarkerEnd({ latitude, longitude }); // Mettre à jour le marqueur
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la localisation :', err);
    }
  };
  
  const saveRunData = async () => {
    const runData = {
      distance,
      time,
      speed,
      path,
      calories,
      startLocation,
      date: new Date().toISOString(),
    };
    if (time === 0 || path.length === 0 && distance === 0) return;

    try {
      const storedData = await AsyncStorage.getItem('runData');
      const parsedData = storedData ? JSON.parse(storedData) : [];
      const updatedArray = [...parsedData, runData];
      await AsyncStorage.setItem('runData', JSON.stringify(updatedArray));
      console.log('Run data saved');
    } catch (error) {
      console.error('Erreur lors du chargement des données :', error);
    }
  };
  //#endregion

  //#region UseEffects
  // Démarrer le podomètre
  useEffect(() => {
    permissions();
    const initLocation = async () => {
      await getLocation();
    };
    initLocation();
  },[]);

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
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    else {
      // Récupérer les données et les enregistrer
      saveRunData();
    }
    return () => {
      clearInterval(interval);
    }; // Nettoyage à l'arrêt
  }, [isRunning]);

  useEffect(() => {
    let interval2: NodeJS.Timeout;
    if (isRunning) {
      interval2 = setInterval(updateLocationAndStats, 1000);
    } else {
    }
    return () => clearInterval(interval2); // Nettoyage
  }, [isRunning, path, distance, time]);
  
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
              {markerStart && 
                <Marker coordinate={markerStart}>
                    <View>
                      <ThemedText>Start</ThemedText>
                    </View>
                </Marker>}

              {markerEnd && 
                <Marker coordinate={markerEnd}>
                    <View>
                      <ThemedText>End</ThemedText>
                    </View>
                </Marker>}
              <Polyline coordinates={path} strokeColor="blue" strokeWidth={4} />
          </MapView>
          
          {/* Header */}
          <View style={{padding:32, width:'100%'}}>
            <View style={styles.runningHeader}>
                <TouchableOpacity style={[styles.widgetArea, styles.button]} onPress={() => router.back()}>
                  <FontAwesomeIcon icon={faArrowLeft} size={24} color={'white'} />
                </TouchableOpacity>
                <ThemedText>Current Jogging</ThemedText>
                <ThemedText style={{borderRadius:20, backgroundColor:'white', padding:4}}>GPS {hasPermission ? 'On' : 'Off'}</ThemedText>
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
                        {/* <ThemedText type='subtitle'>{calories}</ThemedText> */}
                        <ThemedText type='subtitle'>0</ThemedText>
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