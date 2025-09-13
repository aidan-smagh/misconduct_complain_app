// File: /components/map/SearchSection.tsx
"use client";
import React from "react";
import Search_bar from "@/components/Search_bar";

const SearchSection = ({
  onSearch,
  onSuggestionsFetch,
  onLocateClick,
  onInfoClick,
}) => {
  return (
    <>
      <div className="w-full">
        <Search_bar
          show_map_btn={false}
          onSearch={(value) => {
            console.log("Search Value:", value);
            onSearch(value);
          }}
          onSuggestionsFetch={(query) =>
            onSuggestionsFetch(query).then((suggestions) => {
              console.log("Suggestions:", suggestions);
              return suggestions;
            })
          }
        />
      </div>
      <button
        className="btn_md mt-5 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 
         w-[120px] h-[40px] text-xs md:w-auto md:h-auto md:text-base flex-shrink-0"
        onClick={onLocateClick}
      >
        Locate Me
      </button>

      {/* "?" Button */}
      <button
        className="bg-blue-500 text-white mt-5 rounded-full flex items-center justify-center 
         w-7 h-7 min-w-7 min-h-7 text-lg font-bold text-gray-700 hover:bg-gray-400 flex-shrink-0"
        onClick={onInfoClick}
      >
        ?
      </button>
    </>
  );
};

export default SearchSection;
