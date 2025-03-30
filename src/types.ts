export type RequestBody = {
  query?: string;
};

/** Tipo para calificaciones */
export type Rating = {
  average: number | null;
};

/** Tipo para imágenes */
export type Image = {
  medium: string;
  original: string;
} | null;

/** Tipo para enlaces de episodios */
export type Links = {
  self: { href: string };
  previousepisode?: { href: string };
  nextepisode?: { href: string };
};

/** Tipo para información de episodios */
export type Episode = {
  readonly id: number;
  readonly url: string;
  name: string;
  season: number;
  number: number;
  type: string;
  airdate: string;
  airtime: string;
  airstamp: string;
  runtime?: number;
  rating: Rating;
  image: Image;
  summary?: string;
  show: Show;
  _links: Links;
};

/** Tipo para la información de una serie */
export type Show = {
  readonly id: number;
  readonly url: string;
  name: string;
  type: string;
  language: string;
  genres: string[];
  status: string;
  runtime?: number;
  averageRuntime?: number;
  premiered: string;
  ended?: string;
  officialSite?: string;
  schedule: { time: string; days: string[] };
  rating: Rating;
  weight: number;
  network?: Network;
  webChannel?: WebChannel;
  dvdCountry?: Country;
  externals: ExternalIDs;
  image: Image;
  summary?: string;
  updated: number;
  _links: Links;
};

/** Tipo para información de la cadena de TV */
export type Network = {
  id: number;
  name: string;
  country?: Country;
  officialSite?: string;
};

/** Tipo para canales web */
export type WebChannel = {
  id: number;
  name: string;
  country?: Country;
};

/** Tipo para información de país */
export type Country = {
  name: string;
  code: string;
  timezone: string;
};

/** Tipo para identificadores externos */
export type ExternalIDs = {
  tvrage?: number;
  thetvdb?: number;
  imdb?: string;
};

/** Tipo para una serie en una lista de resultados */
export type Series = {
  readonly id: number;
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  first_air_date: string;
  name: string;
  vote_average: number;
  vote_count: number;
};

/** Tipo detallado de una serie */
export type DetailedSeries = {
  readonly id: number;
  adult: boolean;
  backdrop_path: string;
  created_by: Creator[];
  episode_run_time: number[];
  first_air_date: string;
  genres: Genre[];
  homepage: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: EpisodeInfo;
  name: string;
  next_episode_to_air: null;
  networks: NetworkInfo[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  seasons: Season[];
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
};

/** Tipo para los creadores de la serie */
export type Creator = {
  id: number;
  credit_id: string;
  name: string;
  original_name: string;
  gender: number;
  profile_path?: string;
};

/** Tipo para información de género */
export type Genre = {
  id: number;
  name: string;
};

/** Tipo para información de un episodio */
export type EpisodeInfo = {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  episode_type: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path?: string;
};

/** Tipo para información de una cadena de TV */
export type NetworkInfo = {
  id: number;
  logo_path?: string;
  name: string;
  origin_country: string;
};

/** Tipo para una compañía de producción */
export type ProductionCompany = {
  id: number;
  logo_path?: string;
  name: string;
  origin_country: string;
};

/** Tipo para un país de producción */
export type ProductionCountry = {
  iso_3166_1: string;
  name: string;
};

/** Tipo para temporadas */
export type Season = {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path?: string;
  season_number: number;
  vote_average: number;
};

/** Tipo para idiomas hablados */
export type SpokenLanguage = {
  english_name: string;
  iso_639_1: string;
  name: string;
};

/** Tipo para una playlist */
export type Playlist = {
  collaborative: boolean;
  description: string;
  external_urls: { spotify: string };
  href: string;
  readonly id: string;
  images: ImageInfo[];
  name: string;
  owner: PlaylistOwner;
  primary_color?: string;
  public: boolean;
  snapshot_id: string;
  tracks: { href: string; total: number };
  type: string;
  uri: string;
};

/** Tipo para información de imágenes de una playlist */
export type ImageInfo = {
  height?: number;
  url: string;
  width?: number;
};

/** Tipo para el propietario de la playlist */
export type PlaylistOwner = {
  display_name: string;
  external_urls: { spotify: string };
  href: string;
  readonly id: string;
  type: string;
  uri: string;
};

/** Tipo para un conjunto de playlists */
export type Playlists = {
  href: string;
  limit: number;
  next?: string;
  offset: number;
  previous?: string;
  total: number;
  items?: Playlist[];
};

/** Tipo para la respuesta de una API paginada */
export type ResponseAPI = {
  page: number;
  results: Series[];
  total_pages: number;
  total_results: number;
};
