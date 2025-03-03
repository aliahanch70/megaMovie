import { cookies } from 'next/headers';

export const getServerCookie = async (name: string): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
};

export const setServerCookie = async (name: string, value: string, days: number = 7) => {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    maxAge: days * 24 * 60 * 60,
    path: '/'
  });
};

export const deleteServerCookie = async (name: string) => {
  const cookieStore = await cookies();
  cookieStore.delete(name);
};
