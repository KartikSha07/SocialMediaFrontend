import React, { useState, useEffect, useRef } from "react";
import { axiosClient } from "../../utils/axiosClient";
import Avatar from "../avatar/Avatar";
import { useNavigate } from "react-router-dom";

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const queryRef = useRef("");
  const navigate = useNavigate();

  const fetchUsers = async (search, pageNum) => {
    if (!search.trim()) {
      setResults([]);
      setHasMore(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axiosClient.get(
        `/users/search?query=${encodeURIComponent(search)}&page=${pageNum}&limit=10`
      );
      const users = res.data.result;
      if (pageNum === 1) {
        setResults(users);
      } else {
        setResults((prev) => [...prev, ...users]);
      }
      setHasMore(users.length === 10);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queryRef.current = query;
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers(query, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(queryRef.current, nextPage);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <input
        type="text"
        placeholder="Search by name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "1rem",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "20px"
        }}
      />
      {loading && <p>Searching...</p>}
      <div>
        {results.map((user) => (
          <div
            key={user._id}
            onClick={() => navigate(`/profile/${user._id}`)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              cursor: "pointer",
              borderBottom: "1px solid #eee"
            }}
          >
            <Avatar src={user?.avatar?.url} />
            <div style={{ marginLeft: "10px" }}>
              <strong>{user.name}</strong>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
                {user.email}
              </p>
              {user.mutualFollowers > 0 && (
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#999" }}>
                  Followed by {user.mutualFollowerNames.join(", ")}
                  {user.mutualFollowers > user.mutualFollowerNames.length
                    ? ` and ${
                        user.mutualFollowers -
                        user.mutualFollowerNames.length
                      } others`
                    : ""}
                </p>
              )}
            </div>
          </div>
        ))}
        {!loading && query && results.length === 0 && (
          <p>No users found for "{query}"</p>
        )}
        {hasMore && !loading && (
          <button
            style={{
              marginTop: "15px",
              padding: "10px 16px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#3797f0",
              color: "#fff",
              cursor: "pointer"
            }}
            onClick={loadMore}
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
}
