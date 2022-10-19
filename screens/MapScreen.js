import { View, Text, SafeAreaView, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { GOOGLE_MAPS_APIKEY } from '@env'

const MapScreen = () => {

    const [destination, setDestination] = useState(null)

    useEffect(() => {
        console.log(destination)
    }, [])

  return (
    <SafeAreaView>
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
       
    </SafeAreaView>
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
      },
    input: {
      borderColor: "#888",
      borderWidth:1
    }
  });

export default MapScreen