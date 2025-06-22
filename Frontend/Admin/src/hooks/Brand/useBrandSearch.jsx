import { useState, useEffect } from "react";

const useBrandSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleFocus = () => setShowHistory(true);
  const handleBlur = () => {
    setTimeout(() => {
      setShowHistory(false);

      if (searchQuery.trim() !== "") {
        setSearchHistory((prevHistory) => {
          const newHistory = [
            searchQuery,
            ...prevHistory.filter((q) => q !== searchQuery),
          ];
          return newHistory.slice(0, 5);
        });

        localStorage.setItem(
          "brandSearchHistory",
          JSON.stringify(
            [
              searchQuery,
              ...searchHistory.filter((q) => q !== searchQuery),
            ].slice(0, 5)
          )
        );
      }
    }, 150);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const history =
      JSON.parse(localStorage.getItem("brandSearchHistory")) || [];
    setSearchHistory(history);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      setSearchHistory((prevHistory) => {
        const newHistory = [
          searchQuery,
          ...prevHistory.filter((q) => q !== searchQuery),
        ];
        const historyToSave = newHistory.slice(0, 5);
        localStorage.setItem(
          "brandSearchHistory",
          JSON.stringify(historyToSave)
        );
        return historyToSave;
      });
    }
  }, [searchQuery]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return {
    searchQuery: debouncedQuery,
    handleSearchChange,
    searchHistory,
    showHistory,
    handleFocus,
    handleBlur,
  };
};

export default useBrandSearch;
