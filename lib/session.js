import { cookies } from 'next/headers';
import { isValidSession } from './auth';
export async function authorized() {
  const cookieStore = await cookies();
  return isValidSession(cookieStore.get('lantier_session')?.value);
}
