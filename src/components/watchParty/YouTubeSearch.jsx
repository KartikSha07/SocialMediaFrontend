import React, { useState, useRef, useEffect } from "react";
import { axiosClient } from "../../utils/axiosClient";
import "./WatchParty.scss";

export default function YouTubeSearch({ onSelectVideo }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchVideos = async () => {
    if (!searchTerm.trim()) { setResults([]); setShowResults(false); return; }
    setLoading(true);
    try {
      const res = await axiosClient.get(`/youtube/search?q=${encodeURIComponent(searchTerm)}`);
      setResults(res.data.result || []);
      setShowResults(true);
    } finally { setLoading(false); }
  };

  const handleSelect = (videoId, title) => { onSelectVideo(videoId, title); setShowResults(false); setSearchTerm(""); };

  return (
    <div ref={containerRef} className="youtube-search">
      <input
        type="text"
        value={searchTerm}
        placeholder="Search YouTube..."
        onChange={e => setSearchTerm(e.target.value)}
        onFocus={() => results.length && setShowResults(true)}
        onKeyDown={e => e.key === "Enter" && searchVideos()}
      />
      <button onClick={searchVideos}>Search</button>
      {loading && <p className="muted">Loading...</p>}
      {showResults && results.length > 0 && (
        <div className="youtube-results">
          {results.map(({ id, snippet }) => (
            <div key={id.videoId} className="youtube-result-row"
                 onClick={() => handleSelect(id.videoId, snippet.title)} title={snippet.title}>
              <img src={snippet.thumbnails.default.url} alt={snippet.title} width={80} height={45} />
              <span>{snippet.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
