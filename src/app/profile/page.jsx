// src/app/profile/page.jsx
import Profile from '@/components/profile/ProfileSetup';

export const metadata = {
  title: 'Mi Perfil - Nemo',
  description: 'Gestiona tu información personal',
};

export default function ProfilePage() {
  return <Profile />;
}