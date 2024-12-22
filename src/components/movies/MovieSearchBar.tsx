import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { ytsApi } from '@/lib/api/yts'
import { useTorrents } from '@/hooks/useTorrents'
import { YTSMovie } from '@/lib/api/yts'
import debounce from 'lodash/debounce'

export default function MovieSearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState<YTSMovie[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const { addTorrent } = useTorrents()
  const [inputRect, setInputRect] = useState<DOMRect | null>(null)

  const searchRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Create a debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (!searchQuery.trim()) {
        setMovies([])
        setHasSearched(false)
        return
      }

      setLoading(true)
      setHasSearched(true)
      ytsApi.searchMovies(searchQuery)
        .then(response => {
          setMovies(response.data.movies || [])
        })
        .catch(error => {
          console.error('Search failed:', error)
        })
        .finally(() => {
          setLoading(false)
        })
    }, 1000),
    [setMovies, setHasSearched, setLoading]
  )

  // Trigger search on query change
  useEffect(() => {
    debouncedSearch(query)
    
    // Cleanup
    return () => {
      debouncedSearch.cancel()
    }
  }, [query, debouncedSearch])

  // Handle clicking outside of the search and results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen &&
          searchRef.current &&
          resultsRef.current &&
          !searchRef.current.contains(event.target as Node) &&
          !resultsRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleDownload = async (movie: YTSMovie, torrent: YTSMovie['torrents'][0]) => {
    const magnetUrl = ytsApi.generateMagnetLink(torrent.hash, movie.title)
    try {
      await addTorrent({
        filename: magnetUrl,
        paused: false
      })
      setMovies([]) // Clear results after adding
      setQuery('') // Clear search
      setIsOpen(false) // Close dropdown
    } catch (error) {
      console.error('Failed to add torrent:', error)
    }
  }

  const updatePosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    setInputRect(rect)
  }

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={(e) => {
              setIsOpen(true)
              updatePosition(e.currentTarget)
            }}
            placeholder="Search movies..."
            className={`h-9 w-[300px] rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring ${
              loading ? 'opacity-50' : ''
            }`}
            disabled={loading}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setMovies([])
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results dropdown */}
      {isOpen && inputRect && createPortal(
        <div 
          ref={resultsRef}
          className="fixed z-[9999] w-[400px] rounded-md border border-border bg-card shadow-lg"
          style={{
            top: `${inputRect.bottom + 8}px`,
            left: `${inputRect.left}px`
          }}
        >
          {(movies.length > 0 || hasSearched || loading) && (
            <div className="max-h-[400px] overflow-auto p-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : movies.length > 0 ? (
                movies.map((movie) => (
                  <div
                    key={movie.id}
                    className="flex gap-3 rounded-md p-2 hover:bg-muted"
                  >
                    <img
                      src={movie.medium_cover_image}
                      alt={movie.title}
                      className="h-20 w-14 rounded object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <h4 className="font-medium">{movie.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {movie.year} • Rating: {movie.rating}
                      </p>
                      <div className="mt-2 flex gap-2">
                        {movie.torrents.map((torrent) => (
                          <button
                            key={torrent.hash}
                            onClick={() => handleDownload(movie, torrent)}
                            className="text-xs rounded bg-primary px-2 py-1 text-primary-foreground hover:bg-primary/90"
                          >
                            {torrent.quality}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : hasSearched ? (
                <div className="py-8 text-center text-muted-foreground">
                  No movies found
                </div>
              ) : null}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  )
} 