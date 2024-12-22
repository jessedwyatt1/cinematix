export interface YTSMovie {
  id: number
  url: string
  title: string
  year: number
  rating: number
  runtime: number
  genres: string[]
  summary: string
  language: string
  mpa_rating: string
  background_image: string
  medium_cover_image: string
  torrents: {
    url: string
    hash: string
    quality: string
    type: string
    size: string
    size_bytes: number
  }[]
}

interface YTSResponse {
  status: string
  status_message: string
  data: {
    movie_count: number
    limit: number
    page_number: number
    movies: YTSMovie[]
  }
}

export const ytsApi = {
  searchMovies: async (query: string, page = 1): Promise<YTSResponse> => {
    const params = new URLSearchParams({
      query_term: query,
      page: page.toString(),
      limit: '20'
    })
    
    const response = await fetch(
      `https://yts.mx/api/v2/list_movies.json?${params}`
    )
    return response.json()
  },

  getMovie: async (id: number): Promise<YTSResponse> => {
    const response = await fetch(
      `https://yts.mx/api/v2/movie_details.json?movie_id=${id}&with_images=true`
    )
    return response.json()
  },

  generateMagnetLink: (hash: string, name: string): string => {
    const trackers = [
      'udp://open.demonii.com:1337/announce',
      'udp://tracker.openbittorrent.com:80',
      'udp://tracker.coppersurfer.tk:6969',
      'udp://glotorrents.pw:6969/announce',
      'udp://tracker.opentrackr.org:1337/announce',
      'udp://torrent.gresille.org:80/announce',
      'udp://p4p.arenabg.com:1337',
      'udp://tracker.leechers-paradise.org:6969'
    ]

    const trackersString = trackers
      .map(t => `&tr=${encodeURIComponent(t)}`)
      .join('')

    return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(name)}${trackersString}`
  }
} 