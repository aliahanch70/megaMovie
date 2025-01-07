import { createClient } from './client';
import type { AuthError } from '@supabase/supabase-js';

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

interface SignInData {
  email: string;
  password: string;
}

export async function signUp({ email, password, fullName }: SignUpData) {
  const supabase = createClient();
  
  const { data: { user }, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (signUpError) throw signUpError;
  if (!user) throw new Error('User creation failed');

  const { error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        id: user.id,
        email,
        full_name: fullName,
        role: 'user',
      },
    ]);

  if (profileError) throw profileError;

  return user;
}

export async function signIn({ email, password }: SignInData) {
  const supabase = createClient();
  
  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return user;
}