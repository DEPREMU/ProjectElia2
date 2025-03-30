import { Series } from "../types.js";

const PORT = 3001;

/**
 * Generates a route URL for local API calls.
 *
 * @param {string} value - The endpoint to append to the base URL.
 * @returns {string} - The full API route URL.
 */
export const route = (value: string): string =>
  `http://localhost:${PORT}/${value}`;

/**
 * Creates a regular expression to match a specific placeholder inside double curly braces.
 *
 * @param {string} value - The placeholder name to match.
 * @returns {RegExp} - The generated regex pattern.
 */
export const makeRegex = (value: string): RegExp =>
  new RegExp(`\\{\\{${value}\\}\\}`, "g");

/**
 * Creates a debounced version of a function that delays execution until
 * after a specified time has elapsed since the last invocation.
 *
 * @param {Function} fn - The function to debounce.
 * @param {number} delay - Delay time in milliseconds.
 * @returns {Function} - The debounced function.
 *
 * @example
 * ```typescript
 * const log = (message: string) => console.log(message);
 * const debouncedLog = debounce(log, 300);
 * debouncedLog("Hello");
 * debouncedLog("World");
 * // Only "World" will be logged after 300ms if no further calls are made.
 * ```
 */
export const debounce = (
  fn: (...args: any[]) => void,
  delay: number
): ((...args: any[]) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Generates HTML cards for TV series data.
 *
 * @param {Series[]} data - Array of TV series objects.
 * @returns {Promise<string>} - HTML string of the generated cards.
 */
export const makeCards = async (data: Series[]): Promise<string> => {
  const baseCard = await fetch(route("templates/baseCard.html")).then(
    (response) => response.text()
  );

  const cards = Promise.all(
    data.map(async (card: Series) => {
      let cardResult = baseCard;

      for (const key in card) {
        if (key === "genre_ids") {
          if (!card.genre_ids) {
            cardResult = cardResult.replace(makeRegex("genres"), "");
            continue;
          }

          const genres = await fetch(route("getGenresNames"), {
            method: "POST",
            body: JSON.stringify({ query: card.genre_ids.join(", ") }),
            headers: { "Content-Type": "application/json" },
          })
            .then((response) => response.json())
            .then((data) => data.data);

          const genresButtons = (genres || [])
            .map(
              (genre: string) => `
                <button class="genre-button" onclick="handleSortByGenreClick('${genre}', event)">
                    ${genre}
                </button>\n`
            )
            .join("");

          cardResult = cardResult.replace(makeRegex("genres"), genresButtons);
          continue;
        }

        cardResult = cardResult.replace(
          makeRegex(`card.${key}`),
          String(card[key as keyof Series])
        );
      }

      return cardResult;
    })
  );

  return (await cards).join("\n");
};

/**
 * Fetches TV series data based on a query.
 *
 * @param {string} query - The search query.
 * @returns {Promise<Series[]>} - A promise resolving to an array of TV series.
 */
export const fetchTVWithQuery = async (query: string): Promise<Series[]> =>
  fetch(route("tv"), {
    method: "POST",
    body: JSON.stringify({ query }),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((data) => data.data);

/**
 * Deletes a element by its ID.
 *
 * @param {string} id - The ID of the element.
 */
export const deleteElementById = (id: string): void => {
  const div = document.getElementById(id);
  if (div) div.remove();
};

export const getFilteringGenre = () => {
  const genreSelect = document.getElementById(
    "genre-select"
  ) as HTMLSelectElement;
  return genreSelect.value;
};

// Exposing functions globally (if required for browser usage)
window.Object.assign(window, {
  fetchTVWithQuery,
  makeCards,
  route,
  makeRegex,
  debounce,
  deleteElementById,
  getFilteringGenre,
});
