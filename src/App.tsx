import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

interface Item {
  id: number;
  name: string;
}

interface ApiResponse {
  results: Item[];
  hasMore: boolean;
}

function App() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);

  // Debounce function
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch search results
  const fetchResults = async (query: string, page: number) => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<ApiResponse>(`http://localhost:5000/search?q=${query}&page=${page}`);
      setResults((prevResults) => [...prevResults, ...response.data.results]);
      setHasMore(response.data.hasMore);
    } catch (err) {
      setError("Failed to fetch results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = debounce(fetchResults, 300);

  // Handle search input change
  useEffect(() => {
    setResults([]);
    setPage(1);
    debouncedSearch(query, 1);
  }, [query]);

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading || !hasMore) {
        return;
      }
      setPage((prevPage) => prevPage + 1);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Search System</h1>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="p-2 border border-gray-300 rounded w-full max-w-md"
      />

      {loading && <p className="mt-4">Loading...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      <div className="mt-4">
        {results.length > 0
          ? results.map((item) => (
              <div
                key={item.id}
                className="p-2 border-b border-gray-200"
              >
                {item.name}
              </div>
            ))
          : !loading && <p>No results found.</p>}
      </div>
    </div>
  );
}

export default App;
