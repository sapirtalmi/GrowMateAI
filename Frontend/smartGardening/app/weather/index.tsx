import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../components/header';

type CurrentWeather = {
  temp: number;
  condition: string;
  humidity: number;
  wind_speed: number;
  icon: string;
};

type ForecastDay = {
  date: string;
  description: string;
  icon: string;
  temp_min: number;
  temp_max: number;
  pop: number;
};

export default function WeatherForecastScreen() {
  const [city, setCity] = useState('Tel Aviv');
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await axios.get(
          `https://smart-gardening-functions.azurewebsites.net/api/getweatherforecast?city=${encodeURIComponent(city)}`
        );
        setForecast(res.data.forecast || []);
        setCurrent(res.data.current || null);
        setTips(res.data.tips || []);
      } catch (err) {
        console.error('Failed to fetch weather', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city]);

  if (loading) {
    return (
      <ActivityIndicator
        animating
        size="large"
        style={{ marginTop: 50 }}
        color={theme.colors.primary}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Header title="Weather Forecast" />
      <Text variant="headlineMedium" style={styles.title}>
        <Icon name="map-marker" size={22} /> {city}
      </Text>

      {/* Current Weather */}
      {current && (
        <Card style={styles.currentCard}>
          <Card.Title
            title="Current Weather"
            subtitle={current.condition}
            left={() => (
              <Image
                source={{ uri: `https://openweathermap.org/img/wn/${current.icon}@2x.png` }}
                style={styles.icon}
              />
            )}
          />
          <Card.Content>
            <Text>🌡️ Temp: {current.temp}°C</Text>
            <Text>💧 Humidity: {current.humidity}%</Text>
            <Text>💨 Wind: {current.wind_speed} m/s</Text>
          </Card.Content>
        </Card>
      )}

      {/* Forecast */}
      {forecast.map((day, index) => (
        <Card key={index} style={styles.card}>
          <Card.Title
            title={day.date}
            subtitle={day.description}
            left={() =>
              day.icon ? (
                <Image
                  source={{ uri: `https://openweathermap.org/img/wn/${day.icon}@2x.png` }}
                  style={styles.icon}
                />
              ) : (
                <Icon name="weather-cloudy" size={32} color={theme.colors.primary} />
              )
            }



          />
          <Card.Content>
            <View style={styles.row}>
              <Icon name="arrow-up-bold" size={18} color="red" />
              <Text> High: {day.temp_max}°C</Text>
            </View>
            <View style={styles.row}>
              <Icon name="arrow-down-bold" size={18} color="blue" />
              <Text> Low: {day.temp_min}°C</Text>
            </View>
            <View style={styles.row}>
              <Icon name="weather-rainy" size={18} color="gray" />
              <Text> Chance of rain: {day.pop}%</Text>
            </View>
          </Card.Content>

        </Card>
      ))}

      {/* Recommendations */}
      {tips.length > 0 && (
        <Card style={styles.tipCard}>
          <Card.Title title="Recommendations" left={() => <Icon name="lightbulb-on" size={24} />} />
          <Card.Content>
            {tips.map((tip, i) => (
              <Text key={i} style={{ marginBottom: 4 }}>
                {tip}
              </Text>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5fff5' },
  title: { margin: 20, textAlign: 'center' },
  card: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#e6f4ea' },
  currentCard: { marginHorizontal: 16, marginBottom: 20, backgroundColor: '#dff9e5' },
  tipCard: { margin: 16, backgroundColor: '#fffbe6' },
  icon: { width: 48, height: 48 },
  row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    }

});
