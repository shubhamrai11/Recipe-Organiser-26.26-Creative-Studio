import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addRecipe } from '@/lib/storage';
import type { RecipeFormData } from '@/lib/types';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  ingredients: z.string().min(1, 'Please add some ingredients'),
  steps: z.string().min(1, 'Please add preparation steps'),
  category: z.string(),
  prepTime: z.number().min(1, 'Preparation time must be at least 1 minute'),
  image: z.instanceof(File)
  .refine(file => file.size <= 500 * 1024, 'Image must be less than 500KB')
  .refine(
    file => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
    'Only .jpg, .jpeg, and .png formats are supported'
  )
  .optional(),
});

const CATEGORIES = ['Breakfast', 'Main Course', 'Dessert', 'Drink', 'Snack'];

export function AddRecipe() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      ingredients: '',
      steps: '',
      category: '',
      prepTime: 30
    },
  });


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
  setIsSubmitting(true);
  try {
    let imageUrl = '';
    
    if (values.image) {
      const formData = new FormData();
      formData.append('file', values.image);
      formData.append('upload_preset', 'recipe-organizer');
      
      const response = await fetch('https://api.cloudinary.com/v1_1/dkqtwdcpm/image/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      imageUrl = data.secure_url;
    }

    const recipeData: RecipeFormData = {
      ...values,
      ingredients: values.ingredients.split('\n').filter(Boolean),
      steps: values.steps.split('\n').filter(Boolean),
      image: imageUrl,
      favourite: false
    };
    
    addRecipe(recipeData);
    
    toast.success('Recipe added successfully!');
    navigate('/recipes');
  } catch (error) {
    toast.error('Failed to add recipe');
    console.error(error);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Add New Recipe</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter recipe title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredients</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="2 cups flour&#10;1 cup sugar&#10;2 eggs"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="steps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preparation Steps</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="1. Mix dry ingredients&#10;2. Add wet ingredients&#10;3. Bake at 350°F"
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem
                              key={category.toLowerCase()}
                              value={category.toLowerCase()}
                            >
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prepTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preparation Time (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe Image (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          field.onChange(file);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding Recipe...' : 'Add Recipe'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}