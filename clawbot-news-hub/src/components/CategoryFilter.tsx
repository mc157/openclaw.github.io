export function CategoryFilter() {
  const categories = ['All', 'ClawBot', 'Models', 'Technology', 'Security'];
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Categories</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}