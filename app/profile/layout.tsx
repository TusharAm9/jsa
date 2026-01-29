import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  const session = verifyToken(token);
  if (!session) {
    redirect('/auth/login');
  }

  return <>{children}</>;
}
