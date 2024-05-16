import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const API_URL = 'https://zealand-brook-adrian-indianapolis.trycloudflare.com';

const App = () => {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [resolved, setResolved] = useState('');
  const [id, setId] = useState('');
  const [data, setData] = useState([]);
  const [newResolvedStatus, setNewResolvedStatus] = useState('');
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setLat(location.coords.latitude.toString());
      setLon(location.coords.longitude.toString());
    })();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/getall`);
      const json = await response.json();
      setData(json.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStoreData = async () => {
    try {
      const response = await fetch(`${API_URL}/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat,
          lon,
          resolved,
          time: new Date().toISOString(),
        }),
      });
      const json = await response.json();
      console.log('Stored data with id:', json.id);
      fetchData(); // Refresh data after storing
    } catch (error) {
      console.error('Error storing data:', error);
    }
  };

  const handleUpdateData = async () => {
    try {
      const response = await fetch(`${API_URL}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          resolved: newResolvedStatus,
        }),
      });
      const json = await response.json();
      console.log(json.message);
      fetchData(); // Refresh data after updating
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Water Problem Reporter</Text>
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
            title="Your Location"
          />
        </MapView>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Latitude"
          value={lat}
          onChangeText={setLat}
        />
        <TextInput
          style={styles.input}
          placeholder="Longitude"
          value={lon}
          onChangeText={setLon}
        />
        <TextInput
          style={styles.input}
          placeholder="Resolved Status (true/false)"
          value={resolved}
          onChangeText={setResolved}
        />
        <Button title="Store Data" onPress={handleStoreData} />
      </View>

      <Text style={styles.sectionTitle}>Existing Problems</Text>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>ID: {item.id}</Text>
            <Text>Location: {item.lat}, {item.lon}</Text>
            <Text>Time: {item.time}</Text>
            <Text>Resolved: {item.resolved}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
      />

      <View style={styles.updateContainer}>
        <TextInput
          style={styles.input}
          placeholder="ID of problem to update"
          value={id}
          onChangeText={setId}
        />
        <TextInput
          style={styles.input}
          placeholder="New Resolved Status (true/false)"
          value={newResolvedStatus}
          onChangeText={setNewResolvedStatus}
        />
        <Button title="Update Data" onPress={handleUpdateData} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  updateContainer: {
    width: '100%',
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  map: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
});

export default App;
