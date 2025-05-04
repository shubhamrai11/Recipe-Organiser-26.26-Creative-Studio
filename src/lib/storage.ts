import { Recipe } from './types';
import { jsPDF } from 'jspdf';

const STORAGE_KEY = 'recipes';

export function saveRecipes(recipes: Recipe[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

export function getRecipes(): Recipe[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addRecipe(recipe: Omit<Recipe, 'id' | 'dateAdded'>): Recipe {
  const recipes = getRecipes();
  const newRecipe: Recipe = {
    ...recipe,
    id: crypto.randomUUID(),
    dateAdded: new Date().toISOString(),
  };
  
  recipes.push(newRecipe);
  saveRecipes(recipes);
  return newRecipe;
}

export function toggleFavorite(recipeId: string) {
  const recipes = getRecipes().map(recipe => 
    recipe.id === recipeId 
      ? { ...recipe, favourite: !recipe.favourite } 
      : recipe
  );
  saveRecipes(recipes);
}

export function exportRecipeAsPDF(recipe: Recipe) {
  const doc = new jsPDF();
  
  // Set document margins and initial position
  const margin = 20;
  let verticalPosition = margin;
  const lineHeight = 7;
  const sectionGap = 10;

  // Add title
  doc.setFontSize(20);
  doc.text(recipe.title, margin, verticalPosition);
  verticalPosition += lineHeight * 2;

  // Add Category
  doc.setFontSize(12);
  doc.text(`Category: ${recipe.category}`, margin, verticalPosition);
  verticalPosition += lineHeight + sectionGap;

  // Add preparation time
  doc.setFontSize(12);
  doc.text(`Preparation Time: ${recipe.prepTime} minutes`, margin, verticalPosition);
  verticalPosition += lineHeight + sectionGap;

  // Add ingredients section
  doc.setFontSize(14);
  doc.text('Ingredients:', margin, verticalPosition);
  verticalPosition += lineHeight;
  
  doc.setFontSize(12);
  recipe.ingredients.forEach((ingredient) => {
    // Split long ingredients into multiple lines if needed
    const splitText = doc.splitTextToSize(`• ${ingredient}`, 170);
    doc.text(splitText, margin, verticalPosition);
    verticalPosition += lineHeight * splitText.length;
  });
  
  verticalPosition += sectionGap;

  // Add steps section
  doc.setFontSize(14);
  doc.text('Steps:', margin, verticalPosition);
  verticalPosition += lineHeight;
  
  doc.setFontSize(12);
  recipe.steps.forEach((step, index) => {
    // Split long steps into multiple lines if needed
    const splitText = doc.splitTextToSize(`${index + 1}. ${step}`, 170);
    doc.text(splitText, margin, verticalPosition);
    verticalPosition += lineHeight * splitText.length;
  });

  // Save the PDF
  doc.save(`${recipe.title.replace(/ /g, '_')}_recipe.pdf`);
}

export function exportRecipeAsTXT(recipe: Recipe) {
  let textContent = `=== ${recipe.title} ===\n\n`;

  textContent += `Category: ${recipe.category} \n\n`;
  textContent += `Preparation Time: ${recipe.prepTime} minutes\n\n`;
  
  textContent += `=== Ingredients ===\n`;
  recipe.ingredients.forEach(ingredient => {
    textContent += `- ${ingredient}\n`;
  });
  
  textContent += `\n=== Steps ===\n`;
  recipe.steps.forEach((step, index) => {
    textContent += `${index + 1}. ${step}\n`;
  });
  
  // Create and trigger download
  const blob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${recipe.title.replace(/ /g, '_')}_recipe.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}