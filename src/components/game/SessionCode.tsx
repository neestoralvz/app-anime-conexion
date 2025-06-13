import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface SessionCodeProps {
  code: string;
  onCopy?: () => void;
}

export function SessionCode({ code, onCopy }: SessionCodeProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      if (onCopy) {
        onCopy();
      }
    } catch (err) {
      console.error('Failed to copy session code:', err);
    }
  };

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="text-center text-primary">
          Código de Sesión
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="bg-white border-2 border-dashed border-primary/30 rounded-lg py-4 px-6">
          <span className="text-2xl font-mono font-bold text-primary tracking-wider">
            {code}
          </span>
        </div>
        <Button
          onClick={handleCopy}
          variant="secondary"
          size="sm"
          className="w-full"
        >
          📋 Copiar Código
        </Button>
        <p className="text-xs text-gray-600">
          Comparte este código con tu pareja para que se una a la sesión
        </p>
      </CardContent>
    </Card>
  );
}