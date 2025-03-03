'use client';

import { getCookie as getNextCookie, setCookie as setNextCookie, deleteCookie as deleteNextCookie } from 'cookies-next';

interface CookieOptions {
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export const setCookie = (name: string, value: string, days: number = 7) => {
  setNextCookie(name, value, {
    maxAge: days * 24 * 60 * 60,
    path: '/'
  });
};

export const getCookie = (name: string): string | undefined => {
  return getNextCookie(name)?.toString();
};

export const deleteCookie = (name: string) => {
  deleteNextCookie(name);
};
