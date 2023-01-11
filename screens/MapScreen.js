import { View, Text, SafeAreaView, StyleSheet, Switch, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { GOOGLE_MAPS_APIKEY, TRAVEL_TIME_APPID, TRAVEL_TIME_APIKEY } from '@env'
import MapView, { Marker } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions'
import * as TaskManager from "expo-task-manager"
import * as Location from "expo-location"
import { getDistance } from 'geolib'
import { db } from './../database/config'
import { ref, set, update, onValue, remove } from "firebase/database"
import * as Progress from 'react-native-progress'

// GET USER LOCATION
const LOCATION_TASK_NAME = "LOCATION_TASK_NAME"
let foregroundSubscription = null

// Define the background task for location tracking
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error)
    return
  }
  if (data) {
    // Extract location coordinates from data
    const { locations } = data
    const location = locations[0]
    if (location) {
      console.log("Location in background", location.coords)
    }
  }
})

const MapScreen = () => {
    const ROOMNAME = 'a637528'

    const [origin, setOrigin] = useState(null)
    const [destination, setDestination] = useState(null)
    const [distance, setDistance] = useState(null)

    const [sender, setSender] = useState(false)
    const toggleSwitch = () => { 
      setSender(previousState => !previousState)
    }

    useEffect(() => {
      const timer = setInterval(
        () => checkDestination(),
        5000
      );
      return () => clearInterval(timer)
    }, [])

    useEffect(() => {
          if(sender){
            console.log("Update sender")
            update(ref(db, 'location/' + ROOMNAME), {
              room: ROOMNAME,
              latitude: origin.latitude,
              longitude:origin.longitude
            }).catch((error) => {
              alert(error);
            });
          }
    }, [sender, origin])

    const checkDestination = () => {
      console.log("checkDestination")
      if (!sender){
        const starCountRef = ref(db, 'location/' + ROOMNAME);
        onValue(starCountRef, (snapshot) => {
          const data = snapshot.val();
          setDestination(data)
          console.log("setDestination")
        });
      }
    }

    const mapRef = useRef(null)

    // Request permissions right after starting the app
  useEffect(() => {
    const requestPermissions = async () => {
      const foreground = await Location.requestForegroundPermissionsAsync()
      if (foreground.granted) await Location.requestBackgroundPermissionsAsync()
    }
    requestPermissions()
  }, [])

    // useEffect(() => {
    //     if(!origin || !destination) return;

    //     mapRef.current.fitToSuppliedMarkers(["origin", "destination"], {
    //         edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
    //     });
    // }, [origin, destination])

    useEffect(() => {
          if(!origin || !destination) return;
          console.log("set distance")
          setDistance(
            getDistance(
              { latitude: origin.latitude, longitude: origin.longitude },
              { latitude: destination.latitude, longitude: destination.longitude }
            )
          )
    }, [origin, destination, /* GOOGLE_MAPS_APIKEY */])


     // Start location tracking in foreground
  const startForegroundUpdate = async () => {
    // Check if foreground permission is granted
    const { granted } = await Location.getForegroundPermissionsAsync()
    if (!granted) {
      console.log("location tracking denied")
      return
    }

    // Make sure that foreground location tracking is not running
    foregroundSubscription?.remove()

    // Start watching position in real-time
    foregroundSubscription = await Location.watchPositionAsync(
      {
        // For better logs, we set the accuracy to the most sensitive option
        accuracy: Location.Accuracy.BestForNavigation,
      },
      location => {
        console.log("set origin")
        setOrigin(location.coords)
      }
    )
  }

  useEffect(() => {
    const timer = setInterval(
      () => {
        console.log('startForegroundUpdate')
        startForegroundUpdate()
      },
      5000
      )
    return () => clearInterval(timer)
  }, [])

  return (
    <View>
        {origin?
            <MapView 
              showsUserLocation={true}
              ref={mapRef}
              style={styles.map}
              mapType="mutedStandard"
              initialRegion={{
                  latitude: origin.latitude,
                  longitude: origin.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005
              }}
            >

                {/* {origin && destination &&
                  <MapViewDirections
                    origin={[origin.latitude, origin.longitude]}
                    destination={[destination.latitude, destination.longitude]}
                    apikey={GOOGLE_MAPS_APIKEY}
                    strokeWidth={3}
                    strokeColor='blue'
                    mode='WALKING'
                  />
                } */}

                <Marker
                  coordinate={{
                    latitude: origin.latitude,
                    longitude: origin.longitude,
                  }}
                  title="Origin"
                  // description={origin.description}
                  idenifier="origin"
                  opacity={0}
                />
                

                {destination &&
                    <Marker
                        coordinate={{
                            latitude: destination.latitude,
                            longitude: destination.longitude,
                        }}
                        title="Destination"
                        // description={destination}
                        idenifier="destination"
                    />
                }  
            </MapView> : <View style={styles.loading}><Progress.Bar size={30} color='#f4f3f4' indeterminate={true} /></View> 
        }
        

        <View style={styles.searchContainer}>
            <View style={styles.controls}>
              <Text style={styles.distance}>{distance} meters</Text>
              <View style={styles.switchContainer}>
                <Text>Send location:</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={sender ? "#0000ff" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleSwitch}
                  value={sender}
                  style={styles.switch}
                />
              </View>
              
            </View>
        </View>
          {/* <TouchableOpacity onPress={checkDestination} style={styles.refresh}><Text>Refresh destination</Text></TouchableOpacity> */}
            
    </View>
  )
}

const styles = StyleSheet.create({
    searchContainer: {
        position: "absolute",
        width: "90%",
        backgroundColor: "white",
        shadowColor: "black",
        shadowOffset: {width: 2, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 4,
        padding: 8,
        marginLeft: '5%',
        borderRadius: 8,
        marginTop: 40,
        zIndex: 10
      },
    input: {
      borderColor: "#888",
      borderWidth:1
    },
    map: {
        width: '100%',
        height: '100%'
    },
    distance: {
      padding: 8,
      width: '30%'
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      direction: 'rtl'
    },
    loading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    refresh: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 10,
      shadowColor: "black",
        shadowOffset: {width: 2, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 4,
    }
  });

export default MapScreen