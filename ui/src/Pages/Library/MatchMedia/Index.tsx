import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import NestedFileView from "Components/NestedFileView/Index";
import SimpleSearch from "Components/SimpleSearch";
import AdvancedSearch from "Components/AdvancedSearch/Index";
import { SearchResultContext } from "./Context";
import { SearchResults } from "./Results";

import { useGetUnmatchedMediaFilesQuery } from "api/v1/unmatchedMedia";

import AngleUp from "assets/Icons/AngleUp";
import "./Index.scss";

interface LibraryParams {
  id?: string | undefined;
}

const MatchMedia = () => {
  const { id } = useParams<LibraryParams>();
  const [current, setCurrent] = useState<number | null>(null);
  const [isOpened, setOpened] = useState<boolean>(true);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const { data } = useGetUnmatchedMediaFilesQuery(id!);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const setCurrentCallback = useCallback(
    (current: number | null) => {
      setCurrent(current);
    },
    [setCurrent]
  );

  const toggleOpen = useCallback(() => {
    setOpened(!isOpened);
  }, [isOpened, setOpened]);

  const toggleSuggestions = useCallback(() => {
    setShowSuggestions(!showSuggestions);
  }, [showSuggestions, setShowSuggestions]);

  const toggleSuggestionsOff = useCallback(() => {
    setShowSuggestions(false);
  }, [setShowSuggestions]);

  const matchSelected = useCallback(() => {
    console.log("Matching selected files.");
  }, []);

  const onSearch = useCallback(
    (query, params) => {
      if (!query || query === "") return;

      let searchParams = `query=${query}`;

      for (const param of params) {
        let name = "";
        let content = "";

        // FIXME: A better solution for this needs to be created.
        if (param.name === "Year") name = "year";
        else if (param.name === "Media") name = "media_type";
        else name = param.name.toLowerCase();

        if (name === "media_type") {
          if (param.content === "Movies") content = "movie";
          else content = "tv";
        } else {
          content = param.content.toString();
        }

        searchParams = searchParams.concat("&", `${name}=${content}`);
      }

      setSearchQuery(searchParams);
    },
    [setSearchQuery]
  );

  // effect needed so that we can hide suggestions when the user clicks outside the container.
  useEffect(() => {
    const outsideClickListener = (event: any) => {
      if (!event.target.closest(".advanced-search, .suggestions")) {
        toggleSuggestionsOff();
      }
    };

    document.addEventListener("click", outsideClickListener);

    return () => {
      document.removeEventListener("click", outsideClickListener);
    };
  }, [toggleSuggestionsOff]);

  const files = !data
    ? []
    : Object.entries(data).map(([key, value]) => {
        return {
          name: key,
          type: "folder",
          content: value.map((file) => {
            return {
              name: file.name,
              type: "file",
            };
          }),
        };
      });

  // TODO: Display errors if any.
  return (
    <div className={`match-media open-${isOpened}`}>
      <div className="match-container">
        <div className="match-left">
          <p className="match-head">3 Unmatched files found</p>
          <div className="match-middle">
            <p className="match-label">View and select files to match.</p>
            <SimpleSearch />
          </div>

          <NestedFileView files={files} />
        </div>
        <div className="match-right">
          <div className="search-head">
            <AdvancedSearch
              hideSearchBar={!isOpened}
              showSuggestions={showSuggestions}
              toggleSuggestions={toggleSuggestions}
              onSearch={onSearch}
            />
            <div
              className={`toggle ${!isOpened ? "invert" : ""}`}
              onClick={toggleOpen}
            >
              <AngleUp />
            </div>
          </div>

          <div className="search-results">
            <SearchResultContext.Provider
              value={{
                current,
                setCurrent: setCurrentCallback,
                match: matchSelected,
              }}
            >
              {searchQuery ? <SearchResults query={searchQuery} /> : null}
            </SearchResultContext.Provider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchMedia;
