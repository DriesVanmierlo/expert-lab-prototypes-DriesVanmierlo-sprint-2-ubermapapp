import { View, Text, SafeAreaView, StyleSheet } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { GOOGLE_MAPS_APIKEY } from '@env'
import MapView, { Marker } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions'

const MapScreen = () => {

    const [origin, setOrigin] = useState(null)
    const [destination, setDestination] = useState(null)
    const mapRef = useRef(null)

    useEffect(() => {
        if(!origin || !destination) return;

        mapRef.current.fitToSuppliedMarkers(["origin", "destination"], {
            edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
        });
    }, [origin, destination])

  return (
    <View>
        {origin &&
            <MapView 
                ref={mapRef}
                style={styles.map}
                mapType="mutedStandard"
                initialRegion={{
                    latitude: origin.location.lat,
                    longitude: origin.location.lng,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005
                }}
            >

                {origin && destination &&
                    <MapViewDirections
                        origin={origin.description}
                        destination={destination.description}
                        apikey={GOOGLE_MAPS_APIKEY}
                        strokeWidth={3}
                        strokeColor='blue'
                        mode='WALKING'
                    />
                }<Marker
                        coordinate={{
                            latitude: origin.location.lat,
                            longitude: origin.location.lng,
                        }}
                        title="Origin"
                        description={origin.description}
                        idenifier="origin"
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
                placeholder='Where from?'
                nearbyPlacesAPI='GooglePlacesSearch'
                debounce={400}

                onPress={(data, details = null) => {
                    setOrigin({
                        location: details.geometry.location,
                        description: data.description
                    })
                }}
            />  
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
    }
  });

export default MapScreen