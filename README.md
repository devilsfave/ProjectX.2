
# DermaVision AI

**DermaVision AI** is a mobile application aimed at dermatologists and patients to help analyze skin lesions using AI. It allows patients to log in, book appointments with doctors, and potentially analyze skin lesions using AI tools. Dermatologists can log in, verify themselves, and manage their appointments with patients.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Firebase Integration](#firebase-integration)
- [Authentication](#authentication)
- [Appointment Booking](#appointment-booking)
- [Error Handling](#error-handling)
- [Contributing](#contributing)
- [License](#license)

## Features
- **User Authentication**: Supports email/password, Google, and Facebook authentication for both patients and doctors.
- **Role-Based Access**: Patients and doctors can log in with different roles, granting them access to different features.
- **Appointment Booking**: Patients can schedule appointments with dermatologists, and the appointments can be saved in Firestore and added to the device's calendar.
- **Error Boundaries**: The app is equipped with error handling and displays appropriate error messages for better user experience.
- **Firebase Integration**: Used for authentication, real-time database, and push notifications.

## Technologies Used
- **React Native**: Frontend framework for building cross-platform mobile applications.
- **Expo SDK**: Used for simplifying development and testing.
- **Firebase**: Authentication, Firestore, and push notifications backend.
- **React Navigation**: Handles navigation and screen transitions.
- **Yarn**: Package manager for dependency management.
- **Error Boundaries**: Used to catch and display errors gracefully.
- **TypeScript**: Ensures better type checking and code robustness.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/devilsfave/project_x.git
   ```

2. Navigate to the project directory:
   ```bash
   cd project_x
   ```

3. Install dependencies:
   ```bash
   yarn install
   ```

4. Install required Expo CLI globally if you haven't already:
   ```bash
   yarn global add expo-cli
   ```

## Running the Project

1. Start the Expo server:
   ```bash
   yarn start
   ```

2. Use the Expo Go app on your Android device or emulator to scan the QR code and view the app.

3. For Android development, ensure you have an emulator running or an Android device connected.

## Firebase Integration

1. Set up a Firebase project on the [Firebase Console](https://console.firebase.google.com/).
   
2. Download the `google-services.json` file and place it in your project's `android/app` directory.

3. Add Firebase configuration to your project. Make sure to follow Firebase setup guides for **Authentication**, **Firestore**, and **Push Notifications**.

## Authentication

The app supports email/password authentication, as well as social logins using Google and Facebook. 

- **LoginScreen**: Users can log in with their credentials or social accounts.
- **SignupScreen**: New users can sign up for an account.
- **Role-Based Access**: Different UI is presented depending on whether the user is a **Patient** or **Doctor**.

### Example code for email/password authentication:
```javascript
const handleLogin = async () => {
  try {
    await login(email, password, role); // role determines if the user is a Patient or Doctor
    navigation.navigate('Home');
  } catch (error) {
    setError('Login failed. Please try again.');
  }
};
```

## Appointment Booking

Patients can book appointments with doctors, and these appointments are saved in Firestore. The **BookAppointment** screen allows users to:
- View available doctors.
- Select a date and time for the appointment.
- Save the appointment to Firestore and integrate with the device's calendar.

Example structure for booking appointments:
```javascript
const handleBookAppointment = async (doctorId, date, time) => {
  try {
    await firestore().collection('appointments').add({
      doctorId,
      patientId: user.uid,
      date,
      time,
    });
    // Add to calendar
    addAppointmentToCalendar(date, time);
    sendNotification(doctorId); // Optional: Send push notification to the doctor
  } catch (error) {
    console.error('Error booking appointment:', error);
  }
};
```

## Error Handling

The app uses an `ErrorBoundary` component to catch and display errors. This ensures the app doesn't crash and shows a user-friendly message if something goes wrong.

Example usage of an ErrorBoundary:
```javascript
import ErrorBoundary from './components/ErrorBoundary';

<ErrorBoundary>
  <MainApp />
</ErrorBoundary>
```

## Contributing

We welcome contributions! Here's how you can help:
1. Fork the repository.
2. Create a new branch: `git checkout -b my-branch`.
3. Make your changes and commit them: `git commit -m 'Feature description'`.
4. Push to the branch: `git push origin my-branch`.
5. Create a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

