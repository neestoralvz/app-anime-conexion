'use client';

import { useState } from 'react';
import { Layout, PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { CreateSessionForm } from '@/components/session/CreateSessionForm';
import { JoinSessionForm } from '@/components/session/JoinSessionForm';

export default function HomePage() {
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');

  if (mode === 'create') {
    return (
      <Layout maxWidth="md">
        <PageHeader
          title="Crear Nueva Sesión"
          subtitle="Crea una sesión para invitar a tu compañero"
        />
        
        <Card>
          <CardContent>
            <CreateSessionForm />
            
            <button
              onClick={() => setMode('home')}
              className="w-full mt-6 text-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Volver al inicio
            </button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  if (mode === 'join') {
    return (
      <Layout maxWidth="md">
        <PageHeader
          title="Unirse a Sesión"
          subtitle="Ingresa el código de la sesión existente"
        />
        
        <Card>
          <CardContent>
            <JoinSessionForm />
            
            <button
              onClick={() => setMode('home')}
              className="w-full mt-6 text-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Volver al inicio
            </button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout maxWidth="md">
      <PageHeader
        title="App Anime Conexión"
        subtitle="Encuentra el anime perfecto para ver juntos"
      />
      
      <Card>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600 mb-6">
            Descubre animes que ambos amarán a través de nuestro sistema de selección colaborativa
          </p>
          
          <div className="space-y-3">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => setMode('create')}
            >
              Crear Nueva Sesión
            </Button>
            <Button 
              variant="secondary" 
              className="w-full" 
              size="lg"
              onClick={() => setMode('join')}
            >
              Unirse a Sesión
            </Button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">¿Cómo funciona?</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Selecciona 3 animes que te gustaría ver</li>
              <li>2. Califica cada uno según tu interés</li>
              <li>3. Tu pareja hace lo mismo</li>
              <li>4. Descubran su anime perfecto juntos</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}