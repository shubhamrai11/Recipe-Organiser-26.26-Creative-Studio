import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Clock, Calendar, FileDigit, FileText, Star } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getRecipes, exportRecipeAsPDF, exportRecipeAsTXT, toggleFavorite } from '@/lib/storage';
import type { Recipe } from '@/lib/types';

const CATEGORIES = ["All", "Breakfast", "Main Course", "Dessert", "Drink", "Snack"];

export function Recipes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  // Get filters from URL params or set defaults
  const category = searchParams.get('category') || 'all';
  const sortBy = searchParams.get('sortBy') || 'dateAdded';

  const recipes = getRecipes();

  // Filter and sort recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = category === 'all' || recipe.category === category.toLowerCase();
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'prepTime') {
      return a.prepTime - b.prepTime;
    }
    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
  });

  const updateFilters = (key: string, value: string) => {
    searchParams.set(key, value);
    setSearchParams(searchParams);
  };
  
  const handleToggleFavorite = (recipeId: string) => {
    toggleFavorite(recipeId);

    if (selectedRecipe?.id === recipeId) {
      setSelectedRecipe({
        ...selectedRecipe,
        favourite: !selectedRecipe.favourite
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  updateFilters('search', e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            
            {/* Category Filter */}
            <Select
              value={category}
              onValueChange={(value) => updateFilters('category', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.toLowerCase()} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select
              value={sortBy}
              onValueChange={(value) => updateFilters('sortBy', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateAdded">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Date Added</span>
                  </div>
                </SelectItem>
                <SelectItem value="prepTime">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>Prep Time</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer relative"
              onClick={() => setSelectedRecipe(recipe)}
            >
              <div
                className="absolute top-2 right-2 p-2 rounded-full bg-gray-900/80 dark:bg-gray-900/80 backdrop-blur-sm"
                >
                  <Star
                    size={20}
                    className={recipe.favourite === true 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-gray-400 dark:text-gray-500"}
                  />
              </div>
              <img
                src={recipe.image || "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"}
                alt={recipe.title}
                className="w-full h-48 object-cover"
              />
              
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{recipe.prepTime} mins</span>
                  </div>
                  <span className="capitalize">{recipe.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recipe Details Dialog */}
        <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
          <DialogContent className="max-w-2xl">
            {selectedRecipe && (
              <>
                <DialogHeader>
                  <div className="flex justify-between items-center mt-4">
                    <DialogTitle className="text-2xl">{selectedRecipe.title}</DialogTitle>
                    <button
                      onClick={() => handleToggleFavorite(selectedRecipe.id)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label={selectedRecipe.favourite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star
                        size={24}
                        className={selectedRecipe.favourite 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-gray-400 dark:text-gray-500"}
                      />
                    </button>
                  </div>
                </DialogHeader>
                <div className="mt-2">
                  <img
                    src={selectedRecipe.image || "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg"}
                    alt={selectedRecipe.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Preparation Time: {selectedRecipe.prepTime} minutes
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportRecipeAsPDF(selectedRecipe)}
                        className="flex items-center gap-2"
                      >
                        <FileDigit size={16} />
                        <span>PDF</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportRecipeAsTXT(selectedRecipe)}
                        className="flex items-center gap-2"
                      >
                        <FileText size={16} />
                        <span>TXT</span>
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Ingredients:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedRecipe.ingredients.map((ingredient, index) => (
                          <li key={index}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Steps:</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        {selectedRecipe.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}