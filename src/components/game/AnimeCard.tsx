import { Anime } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface AnimeCardProps {
  anime: Anime;
  onSelect?: (anime: Anime) => void;
  isSelected?: boolean;
  showSelectButton?: boolean;
  className?: string;
}

export function AnimeCard({ 
  anime, 
  onSelect, 
  isSelected = false, 
  showSelectButton = false,
  className 
}: AnimeCardProps) {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(anime);
    }
  };

  return (
    <Card className={`transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''} ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg">
          {anime.title}
          {anime.year && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({anime.year})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 line-clamp-3">
          {anime.synopsis}
        </p>
        
        <div className="flex flex-wrap gap-1">
          {anime.genre.split(',').map((genre) => (
            <span
              key={genre}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {genre.trim()}
            </span>
          ))}
        </div>
        
        {showSelectButton && (
          <Button
            onClick={handleSelect}
            variant={isSelected ? 'success' : 'primary'}
            className="w-full mt-4"
            size="sm"
          >
            {isSelected ? 'Seleccionado' : 'Seleccionar'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}