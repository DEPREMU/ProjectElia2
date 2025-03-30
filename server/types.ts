/**
 * Representa el cuerpo de una solicitud HTTP.
 */
export type RequestBody = {
  /** Consulta opcional enviada en la solicitud. */
  query?: string;
};

/**
 * Representa un episodio de una serie de TV.
 */
export type Episode = {
  id: number;
  url: string;
  name: string;
  season: number;
  number: number;
  type: string;
  airdate: string;
  airtime: string;
  airstamp: string;
  runtime: number;
  rating: { average: number | null };
  image: { medium: string; original: string } | null;
  summary: string | null;
  show: {
    id: number;
    url: string;
    name: string;
    type: string;
    language: string;
    genres: string[];
    status: string;
    runtime: number | null;
    averageRuntime: number | null;
    premiered: string;
    ended: string | null;
    officialSite: string | null;
    schedule: { time: string; days: string[] };
    rating: { average: number | null };
    weight: number;
    network: {
      id: number;
      name: string;
      country: { name: string; code: string; timezone: string } | null;
      officialSite: string | null;
    } | null;
    webChannel: {
      id: number;
      name: string;
      country: { name: string; code: string; timezone: string } | null;
    } | null;
    dvdCountry: { name: string; code: string; timezone: string } | null;
    externals: {
      tvrage: number | null;
      thetvdb: number | null;
      imdb: string | null;
    };
    image: { medium: string; original: string } | null;
    summary: string | null;
    updated: number;
    _links: {
      self: { href: string };
      previousepisode?: { href: string };
      nextepisode?: { href: string };
    };
  };
  _links: {
    self: { href: string };
    show: { href: string; name: string };
  };
};

/**
 * Representa una serie de televisión.
 */
export type Series = {
  /** Indica si la serie es para adultos. */
  adult: boolean;
  /** Ruta del fondo de la serie en la API. */
  backdrop_path: string;
  /** Lista de IDs de los géneros de la serie. */
  genre_ids: number[];
  /** Identificador único de la serie. */
  id: number;
  /** Países de origen de la serie. */
  origin_country: string[];
  /** Idioma original de la serie. */
  original_language: string;
  /** Nombre original de la serie. */
  original_name: string;
  /** Resumen de la serie. */
  overview: string;
  /** Popularidad de la serie en la API. */
  popularity: number;
  /** Ruta del póster de la serie en la API. */
  poster_path: string;
  /** Fecha de estreno de la serie. */
  first_air_date: string;
  /** Nombre de la serie. */
  name: string;
  /** Promedio de votos de los usuarios. */
  vote_average: number;
  /** Número total de votos recibidos. */
  vote_count: number;
};

/**
 * Representa la respuesta de la API al buscar series de televisión.
 */
export type ResponseAPI = {
  /** Número de página actual. */
  page: number;
  /** Lista de series obtenidas en la consulta. */
  results: Series[];
  /** Número total de páginas disponibles. */
  total_pages: number;
  /** Número total de resultados encontrados. */
  total_results: number;
};
