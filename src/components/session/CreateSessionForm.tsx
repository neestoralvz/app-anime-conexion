'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSessionActions } from '@/hooks/useSessionActions';

export function CreateSessionForm() {
  const [nickname, setNickname] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { createSession, isLoading, error } = useSessionActions();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!nickname.trim()) {
      newErrors.nickname = 'El nickname es requerido';
    } else if (nickname.length < 2) {
      newErrors.nickname = 'El nickname debe tener al menos 2 caracteres';
    } else if (nickname.length > 20) {
      newErrors.nickname = 'El nickname no puede exceder 20 caracteres';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(nickname)) {
      newErrors.nickname = 'Solo letras, números, guiones y guiones bajos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    createSession({ nickname: nickname.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Tu Nickname"
        value={nickname}
        onChange={(e) => {
          setNickname(e.target.value);
          if (errors.nickname) {
            setErrors(prev => ({ ...prev, nickname: '' }));
          }
        }}
        error={errors.nickname}
        placeholder="Ej: Animelover123"
        maxLength={20}
      />
      
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Creando...' : 'Crear Nueva Sesión'}
      </Button>
    </form>
  );
}