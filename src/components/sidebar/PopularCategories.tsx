import Link from 'next/link';
import { popularCategories as categoriesData } from '@/data/categories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PopularCategories = () => {
  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Popular Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {categoriesData.map(category => (
            <li key={category.id}>
              <Button variant="ghost" className="w-full justify-start text-foreground hover:bg-accent/20 hover:text-primary" asChild>
                <Link href={`/category/${category.slug}`} className="flex items-center space-x-2">
                  {category.icon && <category.icon className="h-5 w-5 text-primary" />}
                  <span>{category.name}</span>
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default PopularCategories;
