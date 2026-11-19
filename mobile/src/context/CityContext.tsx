import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EnvironmentalLocationContext } from '../types/environment';

const STORAGE_CITY_KEY = '@serpentis_selected_city';
const STORAGE_TEMP_UNIT_KEY = '@serpentis_temp_unit';

export const DEFAULT_PILOT_CITY: EnvironmentalLocationContext = {
  slug: 'badlapur-maharashtra',
  name: 'Badlapur',
  city: 'Badlapur',
  district: 'Thane',
  state: 'Maharashtra',
  locality: 'Badlapur Central',
  latitude: 19.1668,
  longitude: 73.2355,
};

interface CityContextValue {
  selectedCity: EnvironmentalLocationContext;
  temperatureUnit: 'C' | 'F';
  setSelectedCity: (city: EnvironmentalLocationContext) => Promise<void>;
  setTemperatureUnit: (unit: 'C' | 'F') => Promise<void>;
}

const CityContext = createContext<CityContextValue>({
  selectedCity: DEFAULT_PILOT_CITY,
  temperatureUnit: 'C',
  setSelectedCity: async () => {},
  setTemperatureUnit: async () => {},
});

export function useCity() {
  return useContext(CityContext);
}

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [selectedCity, setSelectedCityState] =
    useState<EnvironmentalLocationContext>(DEFAULT_PILOT_CITY);
  const [temperatureUnit, setTemperatureUnitState] = useState<'C' | 'F'>('C');

  useEffect(() => {
    (async () => {
      try {
        const [savedCityJson, savedUnit] = await Promise.all([
          AsyncStorage.getItem(STORAGE_CITY_KEY),
          AsyncStorage.getItem(STORAGE_TEMP_UNIT_KEY),
        ]);
        if (savedCityJson) {
          const parsed = JSON.parse(savedCityJson) as EnvironmentalLocationContext;
          if (parsed && parsed.slug && typeof parsed.latitude === 'number') {
            setSelectedCityState(parsed);
          }
        }
        if (savedUnit === 'F' || savedUnit === 'C') {
          setTemperatureUnitState(savedUnit);
        }
      } catch {
        // Keep Badlapur pilot default on storage failure
      }
    })();
  }, []);

  const setSelectedCity = useCallback(async (city: EnvironmentalLocationContext) => {
    setSelectedCityState(city);
    try {
      await AsyncStorage.setItem(STORAGE_CITY_KEY, JSON.stringify(city));
    } catch {
      // non-fatal
    }
  }, []);

  const setTemperatureUnit = useCallback(async (unit: 'C' | 'F') => {
    setTemperatureUnitState(unit);
    try {
      await AsyncStorage.setItem(STORAGE_TEMP_UNIT_KEY, unit);
    } catch {
      // non-fatal
    }
  }, []);

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        temperatureUnit,
        setSelectedCity,
        setTemperatureUnit,
      }}
    >
      {children}
    </CityContext.Provider>
  );
}
