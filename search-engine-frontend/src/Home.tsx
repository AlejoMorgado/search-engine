// src/Home.tsx
import { useState, useEffect } from "react";
import axios from "axios";

const Home = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        fetchResults(query, page);
      } else {
        setResults([]);
        setError(null);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, page]);

  const fetchResults = async (query: string, page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:5001/api/search?q=${query}&page=${page}`);
      setResults(response.data.results);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError((err as any).message || "An error occurred while fetching results.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="p-4 w-full flex justify-center w-screen">
      <div className="">
        <h1 className="text-2xl font-bold mb-4">Search System</h1>
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="p-2 border border-gray-300 rounded-xl w-full max-w-md focus:outline-none bg-white text-black
  shadow-xl transition-shadow"
        />
        {loading && <p className="mt-4 text-gray-600">Loading...</p>}
        {error && <p className="mt-4 text-red-500">{error}</p>}
        <div className="mt-4 bg-white text-black rounded-xl shadow-xl">
          {results.length > 0 &&
            results.map((item, index) => (
              <div
                key={index}
                className="p-2 rounded-xl hover:bg-green-custom transition-colors"
              >
                {item.name}
              </div>
            ))}
        </div>
        {results.length === 0 && !loading && <p className="mt-4 text-gray-600">No results found.</p>}
        {results.length > 0 ? (
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              Previous
            </button>
            <p className="text-gray-600">
              Page {page} of {totalPages}
            </p>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Home;
