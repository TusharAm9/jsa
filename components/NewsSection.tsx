'use client';

import useSWR from 'swr';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LatestNews() {
  const { data, error, isLoading } = useSWR('/api/news', fetcher);
  const news = (data?.latestNews || []) as NewsItem[];

  return (
    <div className="p-4 flex flex-col items-center justify-center gap-4 w-full">
      <h2 className="text-red-600 text-2xl font-bold underline">
        Latest News
      </h2>

      {isLoading && <p className="text-gray-600">Loading latest updates...</p>}

      {error && (
        <p className="text-red-600 font-medium">
          Failed to load news
        </p>
      )}

      {!isLoading && news.length === 0 && (
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
            <p className="text-xs text-gray-500 mt-1 font-medium">
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
