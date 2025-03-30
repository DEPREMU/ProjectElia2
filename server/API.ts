import app from "./App.ts";
import express from "express";
import * as types from "./types.ts";
import { optionsAPI, optionsAPISpotify } from "./config.ts";

/**
 * Realiza una búsqueda de series de TV en la API de TMDB.
 *
 * @async
 * @param {string} value - Término de búsqueda.
 * @returns {Promise<types.ResponseAPI>} - Datos de la API con los resultados de la búsqueda.
 * @throws {Error} - Error si la solicitud falla.
 */
const search = async (value: string): Promise<types.ResponseAPI> => {
  const url = `https://api.themoviedb.org/3/search/tv?query=${value}`;
  console.log(value);

  const data: types.ResponseAPI = await fetch(url, optionsAPI)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error:", error);
      throw new Error("Error fetching data");
    });
  console.log(data);

  return data;
};

/**
 * Endpoint para buscar series de TV en TMDB.
 */
app.post("/search", async (req, res) => {
  const body: types.RequestBody = req.body;
  res.header("Content-Type", "application/json");

  if (!body || !body.query) {
    res.status(400).send({ data: null, error: "Name is required" });
    return;
  }

  const data = await search(body.query);

  if (!data) {
    res.status(404).send({ data: null, error: "No data found" });
  }
  console.log("Data:", data);

  res.status(200).send({ data, error: null });
});

/**
 * Endpoint para obtener una lista de series de TV basadas en filtros de TMDB.
 */
app.get("/tv", async (req, res) => {
  const query = req.query || "";

  const data = await fetch(
    `https://api.themoviedb.org/3/discover/tv?${query}`,
    optionsAPI
  ).then((response) => response.json());

  res.status(200).send({ data, error: null });
});

/**
 * Endpoint para obtener detalles de una serie de TV específica por su ID.
 */
app.get("/tv/:id", async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(400).send({ data: null, error: "Id is required" });
    return;
  }

  const url = `https://api.themoviedb.org/3/tv/${id}`;
  const data = await fetch(url, optionsAPI)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error:", error);
      res.status(500).send({ data: null, error: "Error fetching data" });
      return;
    });

  res.status(200).send({ data, error: null });
});

/**
 * Endpoint para obtener series de TV según filtros enviados en el cuerpo de la solicitud.
 */
app.post("/tv", async (req, res) => {
  res.header("Content-Type", "application/json");

  const body: types.RequestBody = req.body;
  const query = (body.query || "").trim();

  const url = `https://api.themoviedb.org/3/discover/tv?${query}`;
  const data = await fetch(url, optionsAPI).then((response) => response.json());

  res.status(200).send({ data, error: null });
});

/**
 * Obtiene la programación de TV del día desde la API de TVMaze.
 *
 * @async
 * @param {express.Request} req - Objeto de solicitud HTTP.
 * @param {express.Response} res - Objeto de respuesta HTTP.
 */
const getSchedule = async (req: express.Request, res: express.Response) => {
  const body: types.RequestBody = req.body;
  let currentDate: Date;

  if (!body || !body.query) {
    currentDate = new Date();
  } else {
    const providedDate = new Date(body.query);
    currentDate = isNaN(providedDate.getTime()) ? new Date() : providedDate;
  }

  const url = `https://api.tvmaze.com/schedule?country=US&date=${
    currentDate.toISOString().split("T")[0]
  }`;

  const data = await fetch(url).then((res) => res.json());

  res.status(200).send({ data, error: null });
};

// Rutas para obtener la programación de TV
app.get("/getSchedule", getSchedule);
app.post("/getSchedule", getSchedule);

/**
 * Endpoint para obtener la lista de géneros de series de TV desde TMDB.
 */
app.get("/genres", async (_, res) => {
  const url = `https://api.themoviedb.org/3/genre/tv/list`;

  const data = await fetch(url, optionsAPI).then((response) => response.json());

  res.status(200).send({ data, error: null });
});

/**
 * Endpoint para obtener los nombres de géneros basados en IDs enviados en la solicitud.
 */
app.post("/getGenresNames", async (req, res) => {
  const body: types.RequestBody = req.body;
  res.header("Content-Type", "application/json");

  if (!body || !body.query) {
    res.status(400).send({ data: null, error: "Id is required" });
    return;
  }

  const url = `https://api.themoviedb.org/3/genre/tv/list`;
  const data = await fetch(url, optionsAPI)
    .then((response) => response.json())
    .then((data) => data.genres);

  const genresNames = data
    .filter((genre: { id: number; name: string }) =>
      body.query?.includes(String(genre.id))
    )
    .map((genre: { id: number; name: string }) => genre.name);

  res.status(200).send({ data: genresNames, error: null });
});

/**
 * Endpoint para buscar listas de reproducción en Spotify relacionadas con una serie de TV.
 */
app.post("/getPlaylistsSeries", async (req, res) => {
  const body: types.RequestBody = req.body;
  res.header("Content-Type", "application/json");

  if (!body || !body.query) {
    res.status(400).send({ data: null, error: "Id is required" });
    return;
  }

  const query: string = encodeURIComponent(body.query + " playlist");

  const data = await fetch(
    `https://api.spotify.com/v1/search?q=${query}&type=playlist`,
    optionsAPISpotify
  ).then((response) => response.json());

  res.status(200).send({ data: data.playlists, error: null });
});

export default app;
