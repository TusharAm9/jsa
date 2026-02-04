'use client';

import { useEffect, useState } from 'react';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export default function LatestNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestNews();
  }, []);

  const fetchLatestNews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/news');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch news');
      }

      setNews(data.latestNews || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center gap-4">
      {/* Title */}
      <h2 className="text-red-600 text-2xl font-bold underline">
        Latest News
      </h2>

      {/* Loading */}
      {loading && <p className="text-gray-600">Loading latest updates...</p>}

      {/* Error */}
      {error && (
        <p className="text-red-600 font-medium">
          {error}
        </p>
      )}

      {/* News List */}
      {!loading && news.length === 0 && (
        <p className="text-gray-500">No news available</p>
      )}

      <ul className="bg-[#83bff6] p-4 rounded-lg shadow-md w-full max-w-xl space-y-3">
        {news.map((item) => (
          <li
            key={item.id}
            className="bg-white p-3 rounded shadow-sm"
          >
            <p className="font-semibold text-[#0b2546]">
              {item.title}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              {item.content}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
