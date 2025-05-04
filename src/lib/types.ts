export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  steps: string[];
  category: string;
  prepTime: number;
  image?: string;
  dateAdded: string;
  favourite: boolean;
}

export type RecipeFormData = Omit<Recipe, 'id' | 'dateAdded'>;