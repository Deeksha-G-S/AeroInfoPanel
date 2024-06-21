import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const AeroInfoPanel = () => {
  const [place, setPlace] = useState('');
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [elevation, setElevation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCoordinates = async () => {
    setLoading(true);
    setError(null);
    setLocation(null);
    setWeather(null);
    setElevation(null);

    
    const apiKey =import.meta.env.VITE_COORDINATES_API_KEY;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      place
    )}&key=${apiKey}`;


    try {
      const response = await axios.get(url);
      const result = response.data.results[0];
      const locationData = {
        geometry: result.geometry,
        formatted: result.formatted,
        components: result.components,
        annotations: result.annotations,
      };
      setLocation(locationData);
      fetchWeather(locationData.geometry.lat, locationData.geometry.lng);
      fetchElevation(locationData.geometry.lat, locationData.geometry.lng);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchWeather = async (lat, lng) => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;

    try {
      const response = await axios.get(url);
      setWeather(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchElevation = async (lat, lng) => {
    const url = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`;

    try {
      const response = await axios.get(url);
      setElevation(response.data.results[0].elevation);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom align="center">
        AeroInfo Panel
      </Typography>
     
      <Box mb={3}>
        <TextField
          fullWidth
          label="Place"
          variant="outlined"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
        />
      </Box>

      <Box mb={3}>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchCoordinates}
          disabled={loading}
          fullWidth
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Fetch Details'
          )}
        </Button>
      </Box>
      {location && (
        <Box mt={3} mb={3}>
          <Card>
            <MapContainer 
              center={[location.geometry.lat, location.geometry.lng]} 
              zoom={13} 
              style={{ height: '300px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[location.geometry.lat, location.geometry.lng]}>
                <Popup>{location.formatted}</Popup>
              </Marker>
            </MapContainer>
          </Card>
        </Box>
      )}
      {location && (
        <Box mt={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Location Details
              </Typography>
              <Typography><strong>Formatted Address:</strong> {location.formatted}</Typography>
              <Typography><strong>Latitude:</strong> {location.geometry.lat}</Typography>
              <Typography><strong>Longitude:</strong> {location.geometry.lng}</Typography>
              <Typography><strong>Country:</strong> {location.components.country}</Typography>
              {location.annotations.timezone && (
                <>
                  <Typography><strong>Timezone:</strong> {location.annotations.timezone.name}</Typography>
                  <Typography><strong>Offset:</strong> {location.annotations.timezone.offset_string}</Typography>
                </>
              )}
              {elevation !== null && (
                <Typography><strong>Elevation:</strong> {elevation} meters</Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
      {weather && (
        <Box mt={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weather Details
              </Typography>
              <Typography><strong>Temperature:</strong> {weather.main.temp} °C</Typography>
              <Typography><strong>Humidity:</strong> {weather.main.humidity} %</Typography>
              <Typography><strong>Weather:</strong> {weather.weather[0].description}</Typography>
            </CardContent>
          </Card>
        </Box>
      )}
     
      {error && (
        <Box mt={3}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
    </Container>
  );
};

export default AeroInfoPanel;

