import "../global.css";
import { Slot, Stack } from "expo-router";
import SafeScreen from "../components/SafeScreen";
import Toast from 'react-native-toast-message';
import { AppProvider } from "../context/AppContext";
import Profile from "../components/Profile"; 

export default function RootLayout() {
  return (
    <>
    <AppProvider>
      <Slot/>
      <Profile/>
      <Toast />
    </AppProvider>
    </>
        
  );
}
