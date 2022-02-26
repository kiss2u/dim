import SearchResult from "./SearchResult";
import { useExternalSearchQuery } from "api/v1/searchExternal";

export interface Props {
  query: string;
}

export const SearchResults = (props: Props) => {
  const { query } = props;
  const { data } = useExternalSearchQuery(query);

  const results = !data
    ? []
    : data.map(({ overview, genres, title, rating, id, poster_path }) => {
        return (
          <SearchResult
            description={overview || ""}
            title={title}
            year="2006"
            rating={rating ? rating.toString() : "0"}
            duration="1hr 35m"
            id={id}
            genres={genres || []}
            poster={poster_path || ""}
          />
        );
      });

  return <>{results ? results : null}</>;
};

export default SearchResults;
