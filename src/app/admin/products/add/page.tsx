
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AddProductPage() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [status, setStatus] = useState('Draft'); // Default status
  const [image, setImage] = useState('');
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [offer, setOffer] = useState('');
  const [tags, setTags] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const productData = {
      name,
      category,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      stock: parseInt(stock, 10),
      status,
      image,
      type,
      color,
      material,
      offer,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag), // Split tags by comma
    };

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add product');
      }

      toast({
        title: 'Success!',
        description: `Product "${result.product.name}" added successfully.`,
      });
      router.push('/admin/products'); // Redirect to product list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        variant: 'destructive',
        title: 'Error adding product',
        description: errorMessage,
      });
      console.error("Error adding product:", error);
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
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Fill in the details for the new product.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name *</Label>
                <Input id="productName" placeholder="e.g., Wireless Headphones" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productCategory">Category *</Label>
                <Input id="productCategory" placeholder="e.g., Electronics" value={category} onChange={(e) => setCategory(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productDescription">Description *</Label>
              <Textarea id="productDescription" placeholder="Describe the product..." value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="space-y-2">
                <Label htmlFor="productImage">Product Image URL *</Label>
                <Input id="productImage" placeholder="https://example.com/image.png" value={image} onChange={(e) => setImage(e.target.value)} required />
              </div>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="productOffer">Offer (Optional)</Label>
                <Input id="productOffer" placeholder="e.g., 10% Off, Flash Deal" value={offer} onChange={(e) => setOffer(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productTags">Tags (Optional, comma-separated)</Label>
                <Input id="productTags" placeholder="e.g., wireless, noise-cancelling" value={tags} onChange={(e) => setTags(e.target.value)} />
              </div>
            </div>
            
            <div>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Product
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
