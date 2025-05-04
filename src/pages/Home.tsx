import { useNavigate } from 'react-router-dom';

export function Home() {
  const navigate = useNavigate();

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-r from-orange-100 to-orange-200 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"
            alt="Kitchen background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Discover & Share
            <span className="text-orange-500"> Delicious Recipes</span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our community of food lovers and explore thousands of recipes from around the world.
            Share your culinary creations and inspire others.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/recipes')}
              className="bg-orange-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Explore Recipes
            </button>
            <button 
              onClick={() => navigate('/add-recipe')}
              className="bg-white text-orange-500 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Add Recipe
            </button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Popular Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {['Breakfast', 'Main Course', 'Dessert', 'Drink'].map((category) => (
              <div
                key={category}
                className="bg-orange-50 dark:bg-gray-800 rounded-xl p-6 text-center hover:transform hover:scale-105 transition-transform cursor-pointer"
                onClick={() => navigate(`/recipes?category=${category.toLowerCase()}`)}
              >
                <h3 className="text-xl font-semibold mb-2">{category}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Explore delicious {category.toLowerCase()} recipes
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}