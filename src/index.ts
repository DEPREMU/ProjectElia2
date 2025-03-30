import * as types from "./types.js";
import { openModal } from "./common/modal.js";
import {
  route,
  debounce,
  makeCards,
  fetchTVWithQuery,
} from "./common/functions.js";

// Variables de control para la carga de datos y la paginación
let loadingData = false; // Indica si se está cargando contenido
let currentPage = 1; // Página actual para la paginación

// Elementos del DOM
const cardsContainer = document.querySelector(
  ".cards-container"
) as HTMLDivElement; // Contenedor de tarjetas de series
const genreSelect = document.getElementById(
  "genre-select"
) as HTMLSelectElement; // Selector de género
const searchInput = document.getElementById("search-input") as HTMLInputElement; // Campo de búsqueda

/**
 * Maneja la búsqueda de series en tiempo real con debounce.
 *
 * - Limpia los resultados anteriores.
 * - Si el campo está vacío, recarga la lista completa.
 * - Si hay un término de búsqueda, filtra los resultados.
 */
const handleSearchInput = debounce(async (event: Event) => {
  const searchValue = (event.target as HTMLInputElement).value.trim();

  currentPage = 1; // Reinicia la paginación
  cardsContainer.innerHTML = ""; // Limpia los resultados anteriores
  loadingData = true;

  if (!searchValue) {
    await renderData(); // Cargar todas las series de nuevo
    return;
  }
  genreSelect.value = "all"; // Reinicia el filtro de género
  event.preventDefault(); // Cancela el evento del selector de género

  // Realiza la consulta con el término de búsqueda
  const data: types.ResponseAPI = await fetch(route("search"), {
    method: "POST",
    body: JSON.stringify({ query: searchValue }),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((data) => data.data);

  if (!data || data.results.length === 0) {
    openModal("No Results", "No TV shows found for the search query.");
  } else await renderData(data);

  loadingData = false;
}, 500); // 500ms de espera tras la última tecla presionada

/**
 * Filtra las series por género seleccionado en el `<select>`.
 *
 * - Reinicia la paginación.
 * - Si el usuario elige "Todos", recarga la lista completa.
 * - Si elige un género específico, obtiene los datos filtrados.
 */
const handleGenreChange = async (event: Event) => {
  event.preventDefault();
  currentPage = 1;
  cardsContainer.innerHTML = ""; // Limpia los resultados anteriores
  loadingData = true;
  searchInput.value = ""; // Limpia el campo de búsqueda
  window.scrollTo(0, 0); // Desplaza la ventana al inicio

  const selectedGenre = (event.target as HTMLSelectElement).value;
  const query = selectedGenre === "all" ? "" : `with_genres=${selectedGenre}`;

  await renderData(await fetchTVWithQuery(`${query}&page=1`));
  loadingData = false;
};

/**
 * Carga más contenido cuando el usuario hace scroll hasta cierto punto.
 *
 * - Detecta si el usuario ha llegado cerca del final de la lista.
 * - Si ya se está cargando contenido, no hace nada.
 * - Si hay espacio en pantalla y se necesita más contenido, lo carga.
 */
const handleScroll = debounce(async () => {
  if (loadingData) return; // Evita múltiples llamadas

  const heightDiv = cardsContainer.offsetHeight; // Altura total del contenedor
  const isMobile = window.innerWidth < 768; // Detecta si es móvil
  const scrollPosition = window.innerHeight + window.scrollY; // Posición del scroll

  // Verifica si el usuario ha llegado al final de la lista
  if (scrollPosition < heightDiv - (isMobile ? 450 : 300)) return;

  loadingData = true;
  await renderData();
}, 100); // Espera 100ms antes de ejecutar la función

/**
 * Renderiza la lista de series en el DOM.
 *
 * - Si no recibe datos, los obtiene desde la API.
 * - Si hay un error en la consulta, muestra un modal de error.
 * - Inserta las tarjetas de series en el contenedor.
 */
const renderData = async (data?: types.ResponseAPI | types.Series[]) => {
  if (!data) {
    try {
      const response = await fetch(route("tv"), {
        method: "POST",
        body: JSON.stringify({ query: `page=${currentPage}` }),
        headers: { "Content-Type": "application/json" },
      });
      const json = await response.json();
      data = json.data;
    } catch (error) {
      openModal("Error", "An error occurred while fetching the data.");
      return;
    }
  }

  if (!data) {
    openModal("Error", "No data available.");
    return;
  }

  // Crea las tarjetas de series y las agrega al contenedor
  const cards = await makeCards("results" in data ? data.results : data);
  cardsContainer.innerHTML += cards;
  currentPage++; // Aumenta la paginación
  loadingData = false;
};

/**
 * Configura los eventos cuando el DOM está completamente cargado.
 *
 * - Agrega el evento de scroll para la carga infinita.
 * - Configura el evento de búsqueda en el input.
 * - Maneja el cambio de género en el selector.
 * - Carga los datos iniciales.
 */
document.addEventListener("DOMContentLoaded", async () => {
  window.addEventListener("scroll", handleScroll);
  searchInput.addEventListener("input", handleSearchInput);
  genreSelect.addEventListener("change", handleGenreChange);
  await renderData(); // Cargar datos iniciales
});

const handleSortByGenreClick = async (genre: string, event: Event) => {
  event.stopPropagation(); // Evita que el clic se propague a otros elementos
  currentPage = 1; // Reinicia la paginación
  cardsContainer.innerHTML = ""; // Limpia los resultados anteriores
  loadingData = true;
  window.scrollTo(0, 0); // Desplaza la ventana al inicio
  genreSelect.value = genre; // Actualiza el valor del selector de género
  await renderData(
    await fetchTVWithQuery(`with_genres=${genre.trim()}&page=1`)
  );
};

/**
 * Expone funciones al objeto `window` para ser accesibles globalmente.
 */
Object.assign(window, {
  handleSortByGenreClick,
  renderData, // Hace que `renderData` esté disponible globalmente
});
