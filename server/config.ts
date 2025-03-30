import * as types from "./types.ts";
import dotenv from "dotenv";

/**
 * Puerto en el que se ejecuta el servidor.
 * @constant {number}
 */
export const port = 3001;

/**
 * Nombre de host del servidor.
 * @constant {string}
 */
export const hostname = "localhost";

/**
 * Genera una URL de ruta basada en el host y el puerto.
 *
 * @param {string} value - Ruta específica a añadir a la URL base.
 * @returns {string} - URL completa generada.
 */
export const getRoute = (value: string): string =>
  `http://${hostname}:${port}${value}`;

/**
 * URL base del servidor.
 * @constant {string}
 */
const route = `http://localhost:${port}/`;

/**
 * Carga las variables de entorno desde un archivo `.env`.
 * @constant {dotenv.DotenvConfigOutput}
 */
const env = dotenv.config();

/**
 * Obtiene un token de autenticación de Spotify utilizando credenciales almacenadas en variables de entorno.
 *
 * @async
 * @returns {Promise<string>} - Token de acceso de Spotify.
 * @throws {Error} - Si las credenciales no están configuradas o la solicitud falla.
 */
export const getSpotifyToken = async (): Promise<string> => {
  const clientId = env.parsed?.CLIENT_ID_SPOTIFY;
  const clientSecret = env.parsed?.CLIENT_SECRET_SPOTIFY;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Spotify credentials are not set in the environment variables."
    );
  }

  const tokenUrl = "https://accounts.spotify.com/api/token";
  const credentials = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Spotify token");
  }

  const data = await response.json();
  return data.access_token;
};

/**
 * Crea una expresión regular para coincidir con un valor dentro de dobles llaves `{{valor}}`.
 *
 * @param {string} value - Valor a coincidir dentro de las dobles llaves.
 * @returns {RegExp} - Expresión regular generada.
 */
export const makeRegex = (value: string): RegExp => {
  return new RegExp(`\\{\\{${value}\\}\\}`, "g");
};

/**
 * API Key de TMDB obtenida de las variables de entorno.
 * @constant {string | undefined}
 */
const API_KEY_TMDB = env.parsed?.API_KEY_TMDB;

/**
 * Opciones de configuración para realizar solicitudes a la API de TMDB.
 * @constant {Object}
 * @property {string} method - Método de la solicitud HTTP.
 * @property {Object} headers - Encabezados de la solicitud.
 * @property {string} headers.accept - Tipo de contenido aceptado.
 * @property {string} headers.Authorization - Token de autorización para la API de TMDB.
 */
export const optionsAPI = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY_TMDB}`,
  },
};

/**
 * Token de autenticación de Spotify obtenido de forma asíncrona.
 * @constant {string}
 */
const API_KEY_SPOTIFY = await getSpotifyToken();

/**
 * Opciones de configuración para realizar solicitudes a la API de Spotify.
 * @constant {Object}
 * @property {string} method - Método de la solicitud HTTP.
 * @property {Object} headers - Encabezados de la solicitud.
 * @property {string} headers.accept - Tipo de contenido aceptado.
 * @property {string} headers.Authorization - Token de autorización para la API de Spotify.
 */
export const optionsAPISpotify = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY_SPOTIFY}`,
  },
};

/**
 * Obtiene el horario de episodios desde el servidor y lo transforma en una plantilla HTML.
 *
 * @async
 * @returns {Promise<string>} - HTML generado con los episodios programados.
 */
export const makeSchedule = async (): Promise<string> => {
  const schedule: types.Episode[] = await fetch(`${route}getSchedule`)
    .then((response) => response.json())
    .then((data) => data.data);

  const cardEpisodeSchedule = await fetch(
    `${route}templates/cardEpisodeSchedule.html`
  ).then((response) => response.text());

  const cards = await Promise.all(
    schedule.map(async (episode: types.Episode) => {
      let cardResult = cardEpisodeSchedule;

      for (const key in episode) {
        // Verifica si la clave existe en el objeto y no es una función
        if (!episode[key as keyof types.Episode]) {
          // Si la clave no existe o es falsy, reemplaza con "Unknown"
          cardResult = cardResult.replace(makeRegex(key), "Unknown");
          continue;
        }

        if (key === "show") {
          // Si la clave es "show", reemplaza con el nombre del programa
          cardResult = cardResult.replace(
            makeRegex("showUrl"),
            episode.show.url
          );
          continue;
        }

        // Reemplaza los marcadores de posición en la plantilla con datos reales del episodio
        cardResult = cardResult.replace(
          makeRegex(key),
          episode[key as keyof types.Episode]!.toString()
        );
      }

      return cardResult;
    })
  );

  return cards.join("\n") || ""; // Une todas las tarjetas en un solo string
};
