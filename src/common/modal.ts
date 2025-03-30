import { makeRegex, route } from "./functions.js";
import * as types from "../types.js";

/**
 * Opens a generic modal with a title and message.
 *
 * @param {string} [title="Title"] - The modal title.
 * @param {string} [message="Message"] - The modal message.
 */
export const openModal = async (
  title: string = "Title",
  message: string = "Message"
) => {
  try {
    const modal = document.createElement("div");
    modal.className = "modal";

    const template = await fetch(route("templates/modal.html")).then((res) =>
      res.text()
    );
    modal.innerHTML = template
      .replace(makeRegex("title"), title)
      .replace(makeRegex("message"), message);

    document.body.appendChild(modal);

    const closeButton = modal.querySelector(".close") as HTMLSpanElement;
    closeButton?.addEventListener("click", () => handleCloseModal(modal));
  } catch (error) {
    console.error("Error loading modal template:", error);
  }
};

/**
 * Opens a modal with detailed series information and related playlists.
 *
 * @param {number} id - The ID of the series.
 */
export const openModalSerie = async (id: number) => {
  try {
    // Fetch series information
    const info: types.DetailedSeries = await fetch(route(`tv/${id}`))
      .then((res) => res.json())
      .then((data) => data.data);

    let modalHTML = await fetch(route("templates/modalSerie.html")).then(
      (res) => res.text()
    );

    // Fetch playlists related to the series
    const playlists: types.Playlists = await fetch(
      route("getPlaylistsSeries"),
      {
        method: "POST",
        body: JSON.stringify({ query: info.name }),
        headers: { "Content-Type": "application/json" },
      }
    )
      .then((res) => res.json())
      .then((data) => data.data);

    // Load playlist template
    const playlistsTemplate = await fetch(
      route("templates/playlist.html")
    ).then((res) => res.text());

    if (playlists.items) {
      const playlistsCards = playlists.items
        .map((playlist: types.Playlist | null, index: number) => {
          if (!playlist) return "";

          let playlistResult = playlistsTemplate;
          for (const key in playlist) {
            let value = playlist[key as keyof types.Playlist] || "Unknown";

            if (key === "images") {
              value = playlist.images[0]?.url || "";
              playlistResult = playlistResult.replace(
                makeRegex("urlImage"),
                value
              );
              continue;
            }
            if (key === "external_urls") {
              value = playlist.external_urls.spotify || "";
              playlistResult = playlistResult.replace(
                makeRegex("hrefPlaylist"),
                value
              );
              continue;
            }
            playlistResult = playlistResult.replace(
              makeRegex(key),
              String(value)
            );
          }
          return playlistResult.replace(makeRegex("index"), String(index));
        })
        .filter(Boolean)
        .join("\n");

      modalHTML = modalHTML.replace(makeRegex("playlists"), playlistsCards);
    }

    // Replace placeholders with actual series info
    for (const key in info) {
      let value = info[key as keyof types.DetailedSeries] || "Unknown";

      if (key === "genres") {
        value = info.genres?.map((genre) => genre.name).join(", ") || "Unknown";
      } else if (key === "spoken_languages") {
        value =
          info.spoken_languages?.map((lang) => lang.name).join(", ") ||
          "Unknown";
      }

      modalHTML = modalHTML.replace(makeRegex(key), String(value));
    }

    // Insert modal into the document
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("serie-modal") as HTMLDivElement;
    const closeButton = modal.querySelector(".close-button") as HTMLSpanElement;

    modal.addEventListener("click", (event) => {
      if (event.target === modal) handleCloseModal(modal);
    });

    closeButton?.addEventListener("click", () => handleCloseModal(modal));
  } catch (error) {
    console.error("Error opening series modal:", error);
  }
};

/**
 * Closes a given modal and removes event listeners.
 *
 * @param {HTMLDivElement} modal - The modal element to close.
 */
const handleCloseModal = (modal: HTMLDivElement) => {
  modal?.remove();
};

// Exposing functions globally (if required for browser usage)
(window as any).openModal = openModal;
(window as any).openModalSerie = openModalSerie;
