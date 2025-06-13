import { Anime } from '@/types';
import { AnimeSearchResult } from '@/services/mockAnimeService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface AnimeCardProps {
  anime: Anime | AnimeSearchResult;
  onSelect?: (anime: Anime | AnimeSearchResult) => void;
  onClick?: () => void;
  isSelected?: boolean;
  isDisabled?: boolean;
  showSelectButton?: boolean;
  compact?: boolean;
  className?: string;
}

export function AnimeCard({ 
  anime, 
  onSelect,
  onClick,
  isSelected = false,
  isDisabled = false,
  showSelectButton = false,
  compact = false,
  className 
}: AnimeCardProps) {
  const handleSelect = () => {
    if (onSelect && !isDisabled) {
      onSelect(anime);
    }
    if (onClick && !isDisabled) {
      onClick();
    }
  };

  const genres = anime.genre.split(',').slice(0, compact ? 2 : 4);

  if (compact) {
    return (
      <div 
        className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
        } ${isSelected ? 'bg-blue-50 border border-blue-200' : 'bg-white'} ${className}`}
        onClick={handleSelect}
      >
        {anime.imageUrl && (
          <img
            src={anime.imageUrl}
            alt={anime.title}
            className="w-12 h-16 object-cover rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{anime.title}</h4>
          <p className="text-xs text-gray-500 truncate">{anime.synopsis}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {genres.map((genre) => (
              <span
                key={genre}
                className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {genre.trim()}
              </span>
            ))}
          </div>
          {anime.year && (
            <span className="text-xs text-gray-400">{anime.year}</span>
          )}
        </div>
        {isSelected && (
          <div className="text-blue-500">
            ✓
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`transition-all hover:shadow-md cursor-pointer ${
        isSelected ? 'ring-2 ring-primary bg-blue-50' : ''
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={handleSelect}
    >
      <Card>
      {anime.imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={anime.imageUrl}
            alt={anime.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
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
          {genres.map((genre) => (
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
            onClick={(e) => {
              e.stopPropagation();
              handleSelect();
            }}
            variant={isSelected ? 'success' : 'primary'}
            className="w-full mt-4"
            size="sm"
            disabled={isDisabled}
          >
            {isSelected ? 'Seleccionado' : 'Seleccionar'}
          </Button>
        )}
      </CardContent>
      </Card>
    </div>
  );
}