import { Slot } from 'expo-router';
import "../global.css"; // <-- Esta linha é obrigatória para carregar o Tailwind

export default function RootLayout() {
    return <Slot />;
}