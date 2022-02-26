import v1 from "./index";

export interface SearchResult {
  id: number;
  title: string;
  release_date?: string;
  overview?: string;
  poster_path?: string;
  genres: Array<string>;
  rating?: number;
}

export const search = v1.injectEndpoints({
  endpoints: (build) => ({
    externalSearch: build.query<SearchResult[], string>({
      query: (params) => `media/tmdb_search?${params}`,
    }),
  }),
});

export const { useExternalSearchQuery } = search;

export default search;
