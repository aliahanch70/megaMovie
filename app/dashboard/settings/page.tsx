'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';


export default function AccountSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const supabase = createClientComponentClient();
  const { t } = useLanguage();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setUser(profile);
        setName(profile.full_name);
        setEmail(profile.email);
      }
    };

    getUser();
  }, [supabase]);

  const handleSendVerificationCode = async () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    setIsCodeSent(true);

    try {
      const response = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      if (!response.ok) throw new Error('Failed to send verification code');
      alert('Verification code sent to your email');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert('Error sending verification code: ' + errorMessage);
      setIsCodeSent(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!isCodeSent || verificationCode !== generatedCode) {
      alert('Please enter the correct verification code');
      return;
    }

    setLoading(true);
    try {
      // Update name in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: name })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update email and password using auth API
      if (password || email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: email !== user.email ? email : undefined,
          password: password || undefined
        });

        if (authError) throw authError;
      }

      alert('Changes Saved Successfully');
      setIsCodeSent(false);
      setVerificationCode('');
      setPassword(''); // Clear password field after save
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert('Error saving changes: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">{t('settings.name')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('settings.enterName')}
              />
            </div>
            <div>
              <Label htmlFor="email">{t('settings.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('settings.enterEmail')}
              />
            </div>
            <div>
              <Label htmlFor="password">{t('settings.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('settings.enterPassword')}
              />
            </div>
            <Button 
              onClick={handleSendVerificationCode} 
              disabled={isCodeSent}
              className="mt-2"
            >
              {t('settings.sendCode')}
            </Button>
            {isCodeSent && (
              <div className="mt-2">
                <Label htmlFor="verificationCode">
                  {t('settings.enterCodeSentTo')} {email}
                </Label>
                <Input
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder={t('settings.enterVerificationCode')}
                  maxLength={4}
                />
              </div>
            )}
            <Button onClick={handleSaveChanges} disabled={loading}>
              {loading ? t('settings.saving') : t('settings.saveChanges')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}