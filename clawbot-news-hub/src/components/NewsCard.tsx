interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  url: string;
  author: string;
  timestamp: number;
  category: string;
  score: number;
}

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-bold text-cyan-400 mb-2">{news.title}</h2>
      <p className="text-gray-300 mb-4">{news.content}</p>
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>Source: {news.source}</span>
        <span>Score: {news.score}</span>
      </div>
    </div>
  );
}