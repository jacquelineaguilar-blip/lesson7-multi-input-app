import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

export default function App() {
  // Single state object for both inputs
  const [form, setForm] = useState({
    country: '',
    region: '',
  });

  // Validation errors for each field
  const [errors, setErrors] = useState({
    country: '',
    region: '',
  });

  // Other app states
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Shared handler
  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
    setErrors({ ...errors, [key]: '' });
  };

  const validate = () => {
    let valid = true;
    let newErrors = { country: '', region: '' };

    if (!form.country.trim()) {
      newErrors.country = 'Please enter a country name';
      valid = false;
    }

    if (!form.region.trim()) {
      newErrors.region = 'Please enter a region';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSearch = async () => {
    if (!validate()) return;

    setLoading(true);
    setApiError('');
    setResults([]);

    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${form.country}`
      );

      if (!response.ok) {
        throw new Error('Country not found');
      }

      const data = await response.json();

      // Filter by region typed by user
      const filteredData = data.filter((item) =>
        item.region?.toLowerCase().includes(form.region.toLowerCase())
      );

      setResults(filteredData);
    } catch (error) {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm({
      country: '',
      region: '',
    });
    setErrors({
      country: '',
      region: '',
    });
    setResults([]);
    setApiError('');
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.countryName}>{item.name.common}</Text>
      <Text>Capital: {item.capital ? item.capital[0] : 'N/A'}</Text>
      <Text>Region: {item.region || 'N/A'}</Text>
      <Text>Population: {item.population?.toLocaleString() || 'N/A'}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Country Finder App</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter country name"
        value={form.country}
        onChangeText={(text) => handleChange('country', text)}
      />
      {errors.country ? <Text style={styles.error}>{errors.country}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Enter region (example: Europe)"
        value={form.region}
        onChangeText={(text) => handleChange('region', text)}
      />
      {errors.region ? <Text style={styles.error}>{errors.region}</Text> : null}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" style={styles.loader} />}

      {apiError ? <Text style={styles.error}>{apiError}</Text> : null}

      {!loading && results.length === 0 && !apiError ? (
        <Text style={styles.infoText}>No results yet. Search for a country.</Text>
      ) : null}

      {!loading && results.length === 0 && form.country && form.region && !apiError ? (
        <Text style={styles.error}>No results found.</Text>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#222',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 5,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    marginLeft: 3,
  },
  infoText: {
    textAlign: 'center',
    marginVertical: 15,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#6c757d',
    padding: 14,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 15,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  countryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
});
