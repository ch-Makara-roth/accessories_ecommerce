
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { useState, type FormEvent, type ChangeEvent, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, UploadCloud, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Product as ProductType, Category as CategoryType } from '@/types';
import Image from 'next/image';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { toast } = useToast();

  const [product, setProduct] = useState<Partial<ProductType>>({}); // Use Partial for initial empty state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [status, setStatus] = useState('Draft');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [offer, setOffer] = useState('');
  const [tags, setTags] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [availableCategories, setAvailableCategories] = useState<CategoryType[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    setIsLoadingProduct(true);
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch product details.' }));
        throw new Error(errorData.error || `Failed to fetch product. Status: ${response.status}`);
      }
      const data: ProductType = await response.json();
      setProduct(data);
      setName(data.name);
      setCategory(data.categoryId || '');
      setDescription(data.description);
      setPrice(String(data.price));
      setOriginalPrice(data.originalPrice ? String(data.originalPrice) : '');
      setStock(data.stock ? String(data.stock) : '');
      setStatus(data.status || 'Draft');
      setCurrentImageUrl(data.image);
      setType(data.type || '');
      setColor(data.color || '');
      setMaterial(data.material || '');
      setOffer(data.offer || '');
      setTags(data.tags ? data.tags.join(', ') : '');

    } catch (error) {
      console.error("Error fetching product for edit:", error);
      toast({
        variant: 'destructive',
        title: 'Error Fetching Product',
        description: error instanceof Error ? error.message : String(error),
      });
      router.push('/admin/products'); // Redirect if product can't be fetched
    } finally {
      setIsLoadingProduct(false);
    }
  }, [productId, toast, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data: CategoryType[] = await response.json();
        setAvailableCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories for dropdown:", error);
        toast({ variant: 'destructive', title: 'Error Fetching Categories' });
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
    fetchProduct();
  }, [fetchProduct, toast]);


  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!category) {
      toast({ variant: 'destructive', title: 'Category Required' });
      return;
    }
    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
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
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }
    // If no new image file is provided, the backend should not update the image field.

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorResult = await response.json().catch(() => ({ error: `Server responded with ${response.status}` }));
        throw new Error(errorResult.error || errorResult.details || `Failed to update product. Status: ${response.status}`);
      }

      const result = await response.json();
      toast({
        title: 'Success!',
        description: `Product "${result.product.name}" updated successfully.`,
      });
      router.push('/admin/products');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({ variant: 'destructive', title: 'Error Updating Product', description: errorMessage });
      console.error("Error updating product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProduct || isLoadingCategories) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground">Edit Product: {product.name || '...'}</h1>
        <Button variant="outline" asChild>
          <Link href="/admin/products">Back to Product List</Link>
        </Button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Update the product information below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Section: Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input id="productName" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productCategory">Category *</Label>
                  <Select value={category} onValueChange={setCategory} required disabled={isLoadingCategories}>
                    <SelectTrigger id="productCategory">
                      <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productDescription">Description *</Label>
                  <Textarea id="productDescription" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} />
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
                  <Input id="productPrice" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productOriginalPrice">Original Price ($) (Optional)</Label>
                  <Input id="productOriginalPrice" type="number" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productStock">Stock Quantity *</Label>
                  <Input id="productStock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
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
                  <Input id="productType" value={type} onChange={(e) => setType(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productColor">Color (Optional)</Label>
                  <Input id="productColor" value={color} onChange={(e) => setColor(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productMaterial">Material (Optional)</Label>
                  <Input id="productMaterial" value={material} onChange={(e) => setMaterial(e.target.value)} />
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
                  <Input id="productOffer" value={offer} onChange={(e) => setOffer(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productTags">Tags (Optional, comma-separated)</Label>
                  <Input id="productTags" value={tags} onChange={(e) => setTags(e.target.value)} />
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
              <h3 className="text-lg font-medium text-foreground mb-4">Product Image</h3>
              <div className="space-y-4">
                {currentImageUrl && !imagePreviewUrl && (
                    <div className="mt-4 p-2 border rounded-md inline-block">
                        <p className="text-sm font-medium mb-2 text-muted-foreground">Current Image:</p>
                        <Image 
                            src={currentImageUrl} 
                            alt="Current Product Image" 
                            width={150} 
                            height={150} 
                            className="max-w-xs max-h-48 rounded-md object-contain"
                        />
                    </div>
                )}
                <Label 
                  htmlFor="productImageFile" 
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-1 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload new image</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">(Optional: Replaces current image)</p>
                  </div>
                  <Input 
                    id="productImageFile" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden"
                  />
                </Label>
                {imageFile && <p className="text-sm text-muted-foreground mt-2">New image selected: {imageFile.name}</p>}
                {imagePreviewUrl && (
                  <div className="mt-4 p-2 border rounded-md inline-block">
                    <p className="text-sm font-medium mb-2 text-muted-foreground">New Image Preview:</p>
                    <img 
                        src={imagePreviewUrl} 
                        alt="New Image Preview" 
                        className="max-w-xs max-h-48 rounded-md object-contain" 
                    />
                  </div>
                )}
              </div>
            </div>
            
            <Separator className="my-8" />

            <div className="flex justify-end">
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]" disabled={isLoading || isLoadingProduct || isLoadingCategories}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Update Product
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
