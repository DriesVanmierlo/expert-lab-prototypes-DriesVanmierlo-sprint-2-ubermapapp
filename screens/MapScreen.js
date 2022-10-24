import { View, Text, SafeAreaView, StyleSheet } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { GOOGLE_MAPS_APIKEY, TRAVEL_TIME_APPID, TRAVEL_TIME_APIKEY } from '@env'
import MapView, { Marker } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions'
import * as TaskManager from "expo-task-manager"
import * as Location from "expo-location"
import { getDistance } from 'geolib'


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

    const [origin, setOrigin] = useState(null)
    const [destination, setDestination] = useState(null)
    const [distance, setDistance] = useState(null)
    const mapRef = useRef(null)

    // Request permissions right after starting the app
  useEffect(() => {
    const requestPermissions = async () => {
      const foreground = await Location.requestForegroundPermissionsAsync()
      if (foreground.granted) await Location.requestBackgroundPermissionsAsync()
    }
    requestPermissions()
  }, [])

    useEffect(() => {
        if(!origin || !destination) return;

        mapRef.current.fitToSuppliedMarkers(["origin", "destination"], {
            edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
        });
    }, [origin, destination])

    useEffect(() => {
      if(!origin || !destination) return;
      
      // const getTravelDistance = async() => {
        // fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin}&destinations=${destination}&key=${GOOGLE_MAPS_APIKEY}`)
        // OR
        // fetch(`https://api.traveltimeapp.com/v4/time-filter?type=walking&departure_time=2022-10-19T07:00:00Z&search_lat=${origin.latitude}&search_lng=${origin.longitude}&locations=${destination.location.lat}_${destination.location.lng}&app_id=${TRAVEL_TIME_APPID}&api_key=${TRAVEL_TIME_APIKEY}`)
        // .then((res) => res.json())
        // .then(data => {
        //   console.log(data)
        // })
      // }
      
      // getTravelDistance()
      
      setDistance(
        getDistance(
          { latitude: origin.latitude, longitude: origin.longitude },
          { latitude: destination.location.lat, longitude: destination.location.lng }
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
        setOrigin(location.coords)
        console.log(origin)
      }
    )
  }

  startForegroundUpdate()

  return (
    <View>
        {origin &&
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

                {origin && destination &&
                    <MapViewDirections
                        origin={[origin.latitude, origin.longitude]}
                        destination={destination.description}
                        apikey={GOOGLE_MAPS_APIKEY}
                        strokeWidth={3}
                        strokeColor='blue'
                        mode='WALKING'
                    />
                }<Marker
                        coordinate={{
                            latitude: origin.latitude,
                            longitude: origin.longitude,
                        }}
                        title="Origin"
                        // description={origin.description}
                        idenifier="origin"
                        opacity={0}
                    />
                

                {destination?.location &&
                    <Marker
                        coordinate={{
                            latitude: destination.location.lat,
                            longitude: destination.location.lng,
                        }}
                        title="Destination"
                        description={destination.description}
                        idenifier="destination"
                    />
                }  
            </MapView>
        }
        

        <View style={styles.searchContainer}>
           {/* <GooglePlacesAutocomplete
                style={{textInput: styles.input}}
                enablePoweredByContainer={false}
                minLength={2}
                query={{
                    key: GOOGLE_MAPS_APIKEY,
                    language: 'en'
                }}
                fetchDetails={true}
                returnKeyType={"search"}
                placeholder='Where from?'
                nearbyPlacesAPI='GooglePlacesSearch'
                debounce={400}

                onPress={(data, details = null) => {
                    setOrigin({
                        location: details.geometry.location,
                        description: data.description
                    })
                }}
            />   */}
            <GooglePlacesAutocomplete
                style={{textInput: styles.input}}
                enablePoweredByContainer={false}
                minLength={2}
                query={{
                    key: GOOGLE_MAPS_APIKEY,
                    language: 'en'
                }}
                fetchDetails={true}
                returnKeyType={"search"}
                placeholder='Where to?'
                nearbyPlacesAPI='GooglePlacesSearch'
                debounce={400}

                onPress={(data, details = null) => {
                    setDestination({
                        location: details.geometry.location,
                        description: data.description
                    })
                }}
            />
            <View>
              <Text style={styles.distance}>{distance} meters</Text>
            </View>
        </View>
            
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
      position: 'absolute',
      backgroundColor: "white",
      shadowColor: "black",
      shadowOffset: {width: 2, height: 2},
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 4,
      padding: 8,
      borderRadius: 8,
      marginTop: 20,
      zIndex: 10
    },
  });

export default MapScreen