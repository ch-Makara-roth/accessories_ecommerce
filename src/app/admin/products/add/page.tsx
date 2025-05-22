
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { useState, type FormEvent, type ChangeEvent, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, UploadCloud } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Category as CategoryType } from '@/types';

export default function AddProductPage() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(''); // Will store category ID
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [status, setStatus] = useState('Draft');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [offer, setOffer] = useState('');
  const [tags, setTags] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<CategoryType[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch categories and parse error response' }));
          throw new Error(errorData.error || `Failed to fetch categories. Status: ${response.status}`);
        }
        const data: CategoryType[] = await response.json();
        setAvailableCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories for dropdown:", error);
        toast({
          variant: 'destructive',
          title: 'Error Fetching Categories',
          description: error instanceof Error ? error.message : String(error),
        });
        setAvailableCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [toast]);


  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl); // Revoke old URL before creating new one
      }
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImagePreviewUrl(null);
    }
  };

  useEffect(() => {
    // Cleanup function to revoke object URL when component unmounts or imagePreviewUrl changes
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!category) {
      toast({
        variant: 'destructive',
        title: 'Category Required',
        description: 'Please select a category for the product.',
      });
      return;
    }
    if (!imageFile) {
      toast({
        variant: 'destructive',
        title: 'Image Required',
        description: 'Please select an image for the product.',
      });
      return;
    }
    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category); // category state holds the ID
    formData.append('description', description);
    formData.append('price', price);
    if (originalPrice) formData.append('originalPrice', originalPrice);
    formData.append('stock', stock);
    formData.append('status', status);
    if (type) formData.append('type', type);
    if (color) formData.append('color', color);
    if (material) formData.append('material', material);
    if (offer) formData.append('offer', offer);
    formData.append('tags', tags);
    formData.append('imageFile', imageFile);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });

      let errorResult;
      let serverErrorMsg = `An unexpected error occurred. Status: ${response.status}`;
      if (!response.ok) {
        const errorResponseText = await response.text();
        try {
          errorResult = JSON.parse(errorResponseText);
          serverErrorMsg = errorResult.error || errorResult.details || `Server responded with ${response.status}`;
        } catch (e) {
           if (errorResponseText && errorResponseText.trim().toLowerCase().startsWith('<!doctype html>')) {
             serverErrorMsg = `Server returned an HTML error page (status ${response.status}). This strongly suggests a server-side configuration issue. Please: 1. Verify MONGODB_URI in your .env.local file is correct AND includes your database name. 2. Restart your Next.js server. 3. Check server console logs for more details.`;
           } else if (errorResponseText) {
            serverErrorMsg += ` (Raw server response snippet: ${errorResponseText.substring(0,200)}...)`;
          }
          console.error("Client-side: Failed to parse API POST error response as JSON. Status:", response.status, "Response text:", errorResponseText.substring(0,500));
        }
        throw new Error(serverErrorMsg);
      }

      const result = await response.json();

      toast({
        title: 'Success!',
        description: `Product "${result.product.name}" added successfully. Image URL (simulated): ${result.product.image}`,
      });
      router.push('/admin/products');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      const isHtmlError = errorMessage.includes("Server returned an HTML error page");
      
      toast({
        variant: 'destructive',
        title: 'Error Adding Product',
        description: errorMessage,
        duration: isHtmlError ? 9000 : 5000,
      });
      console.error("Error adding product (handleSubmit):", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground">Add New Product</h1>
        <Button variant="outline" asChild>
          <Link href="/admin/products">Back to Product List</Link>
        </Button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Fill in all the necessary information for the new product.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Section: Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input id="productName" placeholder="e.g., Wireless Headphones" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productCategory">Category *</Label>
                  <Select value={category} onValueChange={setCategory} required disabled={isLoadingCategories}>
                    <SelectTrigger id="productCategory">
                      <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCategories ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">Loading categories...</div>
                      ) : availableCategories.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">No categories found. Add categories first.</div>
                      ) : (
                        availableCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productDescription">Description *</Label>
                  <Textarea id="productDescription" placeholder="Detailed description of the product..." value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Section: Pricing & Stock */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Pricing & Stock</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="productPrice">Price ($) *</Label>
                  <Input id="productPrice" type="number" step="0.01" placeholder="e.g., 99.99" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productOriginalPrice">Original Price ($) (Optional)</Label>
                  <Input id="productOriginalPrice" type="number" step="0.01" placeholder="e.g., 129.99" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productStock">Stock Quantity *</Label>
                  <Input id="productStock" type="number" placeholder="e.g., 100" value={stock} onChange={(e) => setStock(e.target.value)} required />
                </div>
              </div>
            </div>

            <Separator />

            {/* Section: Product Attributes */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Product Attributes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="productType">Type (Optional)</Label>
                  <Input id="productType" placeholder="e.g., Over-ear, In-ear" value={type} onChange={(e) => setType(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productColor">Color (Optional)</Label>
                  <Input id="productColor" placeholder="e.g., Black, Rose Gold" value={color} onChange={(e) => setColor(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productMaterial">Material (Optional)</Label>
                  <Input id="productMaterial" placeholder="e.g., Plastic, Aluminum" value={material} onChange={(e) => setMaterial(e.target.value)} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Section: Categorization & Status */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Categorization & Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="productOffer">Offer/Discount (Optional)</Label>
                  <Input id="productOffer" placeholder="e.g., 10% Off, Flash Deal" value={offer} onChange={(e) => setOffer(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productTags">Tags (Optional, comma-separated)</Label>
                  <Input id="productTags" placeholder="e.g., wireless, noise-cancelling, featured" value={tags} onChange={(e) => setTags(e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="productStatus">Status *</Label>
                    <Select value={status} onValueChange={setStatus} required>
                      <SelectTrigger id="productStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Archived">Archived</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              </div>
            </div>

            <Separator />

            {/* Section: Product Image */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Product Image *</h3>
              <div className="space-y-2">
                <Label 
                  htmlFor="productImageFile" 
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-1 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                  </div>
                  <Input 
                    id="productImageFile" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden"
                    // required is handled by the submit handler check for imageFile
                  />
                </Label>
                {imageFile && <p className="text-sm text-muted-foreground mt-2">Selected: {imageFile.name}</p>}
                {imagePreviewUrl && (
                  <div className="mt-4 p-2 border rounded-md inline-block">
                    <p className="text-sm font-medium mb-2 text-muted-foreground">Image Preview:</p>
                    <img 
                        src={imagePreviewUrl} 
                        alt="Image Preview" 
                        className="max-w-xs max-h-48 rounded-md object-contain" 
                    />
                  </div>
                )}
              </div>
            </div>
            
            <Separator className="my-8" />

            <div className="flex justify-end">
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]" disabled={isLoading || isLoadingCategories}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Product
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
    

    