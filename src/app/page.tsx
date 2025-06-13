import { Layout, PageHeader } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function HomePage() {
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
            <Button className="w-full" size="lg">
              Crear Nueva Sesión
            </Button>
            <Button variant="secondary" className="w-full" size="lg">
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