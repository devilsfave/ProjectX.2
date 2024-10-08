import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user, role } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="results" />
          <Stack.Screen name="analysis" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="nearbyFacilities" />
          {role === 'patient' && <Stack.Screen name="doctorList" />}
          <Stack.Screen name="appointmentBooking" />
          {role === 'admin' && <Stack.Screen name="adminPanel" />}
        </>
      ) : (
        <>
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
          <Stack.Screen name="appointmentBooking" />
        </>
      )}
      {!user && <Stack.Screen name="consent" options={{ headerShown: false }} />}
    </Stack>
  );
}