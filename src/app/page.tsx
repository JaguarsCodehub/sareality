import { redirect } from 'next/navigation';

export default function Home() {
  // We don't have a public marketing site, so redirect the root to the internal dashboard
  // The Auth Context will catch unauthenticated users and redirect them to /login
  redirect('/dashboard');
}
