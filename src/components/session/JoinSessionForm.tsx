'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSessionActions } from '@/hooks/useSessionActions';

export function JoinSessionForm() {
  const [formData, setFormData] = useState({
    code: '',
    nickname: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { joinSession, isLoading, error } = useSessionActions();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'El código de sesión es requerido';
    } else if (formData.code.length !== 6) {
      newErrors.code = 'El código debe tener 6 caracteres';
    } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
      newErrors.code = 'Código inválido';
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = 'El nickname es requerido';
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = 'El nickname debe tener al menos 2 caracteres';
    } else if (formData.nickname.length > 20) {
      newErrors.nickname = 'El nickname no puede exceder 20 caracteres';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.nickname)) {
      newErrors.nickname = 'Solo letras, números, guiones y guiones bajos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    joinSession({
      code: formData.code.trim().toUpperCase(),
      nickname: formData.nickname.trim(),
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Código de Sesión"
        value={formData.code}
        onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
        error={errors.code}
        placeholder="Ej: ABC123"
        maxLength={6}
      />
      
      <Input
        label="Tu Nickname"
        value={formData.nickname}
        onChange={(e) => handleInputChange('nickname', e.target.value)}
        error={errors.nickname}
        placeholder="Ej: AnimeExpert456"
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
        {isLoading ? 'Uniéndose...' : 'Unirse a Sesión'}
      </Button>
    </form>
  );
}