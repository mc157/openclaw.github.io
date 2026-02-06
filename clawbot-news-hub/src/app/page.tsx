import { NewsCard } from '@/components/NewsCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { LiveTicker } from '@/components/LiveTicker';
import { aggregateData } from '@/lib/aggregator';

export default async function Home() {
  const news = await aggregateData();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-cyan-400">ClawBot News Hub</h1>
          <p className="text-gray-300">Cyberpunk News Aggregation</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <CategoryFilter />
            </div>
            
            <div className="space-y-6">
              {news.items.map((item: any) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <LiveTicker />
          </div>
        </div>
      </main>
    </div>
  );
}