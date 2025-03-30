import express from "express";
import fs from "fs";
import app from "./API.ts";
import { pathFile } from "./App.ts";
import { port, hostname, makeRegex, getRoute, makeSchedule } from "./config.ts";
import * as types from "./types.ts";

/**
 * Maneja la solicitud GET a la ruta raíz ("/").
 * Carga y procesa la página principal con información de programación y series de TV.
 *
 * @async
 * @param {express.Request} _ - Objeto de solicitud (no utilizado).
 * @param {express.Response} res - Objeto de respuesta HTTP.
 */
app.get("/", async (_, res) => {
  // Carga el archivo HTML principal
  let html = fs.readFileSync(pathFile("index.html"), "utf-8");

  // Reemplaza el marcador de programación con la programación generada dinámicamente
  html = html.replace(makeRegex("schedule"), await makeSchedule());

  // Obtiene los datos de series de TV desde el API
  const data: types.ResponseAPI | null = await fetch(getRoute("/tv"))
    .then((response) => response.json())
    .then((data) => data.data);

  if (!data) {
    res.status(404).send("No data found");
    return;
  }

  // Carga la plantilla de tarjeta base
  const baseCard = fs.readFileSync(
    pathFile("/templates/baseCard.html"),
    "utf-8"
  );

  let allGenres: { [key: string]: string } = {};

  // Genera tarjetas para cada serie de TV
  const cards = Promise.all(
    data.results.map(async (card: types.Series) => {
      let cardResult = baseCard;

      for (const key in card) {
        if (key === "genre_ids") {
          if (!card.genre_ids) {
            cardResult = cardResult.replace(makeRegex("genres"), "");
            continue;
          }

          // Obtiene los nombres de los géneros desde la API
          const genres: string[] | null = await fetch(
            getRoute("/getGenresNames"),
            {
              method: "POST",
              body: JSON.stringify({ query: card.genre_ids.join(", ") }),
              headers: { "Content-Type": "application/json" },
            }
          )
            .then((response) => response.json())
            .then((data) => data.data);

          // Almacena los géneros únicos
          genres?.forEach((genre: string, index) => {
            if (!allGenres[genre]) {
              allGenres[genre] = card.genre_ids[index].toString();
            }
          });

          // Genera los botones de géneros
          const genresButtons: string = (genres ? genres : [])
            .map((genre: string) => {
              return `
            <button
                class="genre-button"
                onclick="handleSortByGenreClick('${allGenres[genre]}', event)">
              ${genre}
            </button>\n`;
            })
            .join("");

          cardResult = cardResult.replace(makeRegex("genres"), genresButtons);
          continue;
        }

        // Reemplaza los marcadores en la plantilla con los datos de la serie
        cardResult = cardResult.replace(
          makeRegex(`card.${key}`),
          String(card[key as keyof types.Series])
        );
      }

      return cardResult;
    })
  );

  // Inserta las tarjetas en el HTML
  html = html.replace(makeRegex("firstPage"), (await cards).join(""));

  // Inserta las opciones de género en el selector
  html = html.replace(
    makeRegex("optionsGenres"),
    Object.entries(allGenres)
      .map(([key, genre]) => {
        return `<option value="${genre}">${key}</option>`;
      })
      .join("\n")
  );

  res.header("Content-Type", "text/html");
  res.status(200).send(html);
});

/**
 * Serves static files from the public directory.
 */
app.use(express.static(pathFile("")));

/**
 * Inicia el servidor Express y lo pone en escucha en el puerto y hostname configurados.
 */
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
