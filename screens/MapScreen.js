import { View, Text, SafeAreaView, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { GOOGLE_MAPS_APIKEY } from '@env'
import MapView, { Marker } from 'react-native-maps'

const MapScreen = () => {

    // const [destination, setDestination] = useState({location: {lat: 50.847, lng: 4.357}})
    const [destination, setDestination] = useState(null)

  return (
    <View>

        {destination &&
            <MapView 
                style={styles.map}
                mapType="mutedStandard"
                initialRegion={{
                    latitude: destination?.location.lat,
                    longitude: destination?.location.lng,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05
                }}
            >
                {destination?.location &&
                    <Marker
                        coordinate={{
                            latitude: destination?.location.lat,
                            longitude: destination?.location.lng,
                        }}
                        title="Destination"
                        description={destination.description}
                        idenifier="origin"
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
            placeholder='Where to?'
            nearbyPlacesAPI='GooglePlacesSearch'
            debounce={400}

            onPress={(data, details = null) => {
                setDestination({
                    location: details.geometry.location,
                    description: data.description
                })
                console.log(destination)
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