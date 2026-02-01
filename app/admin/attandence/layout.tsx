import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;

  if (!token) {
    redirect('/login');
  }

  const session = verifyToken(token);
  if (!session) {
    redirect('/login');
  }

  // Check if user is admin
  if (session.role !== 'ADMIN') {
    redirect('/');
  }

  return <>{children}</>;
}