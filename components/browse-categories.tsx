import Link from 'next/link';

const categories = [
  { name: 'Footy', icon: '/placeholder.svg?height=64&width=64' },
  { name: 'Restaurants', icon: '/placeholder.svg?height=64&width=64' },
  { name: 'Chemist', icon: '/placeholder.svg?height=64&width=64' },
  { name: 'Deals', icon: '/placeholder.svg?height=64&width=64' },
  { name: 'Grocery', icon: '/placeholder.svg?height=64&width=64' },
  { name: 'Convenience', icon: '/placeholder.svg?height=64&width=64' },
  { name: 'Retail', icon: '/placeholder.svg?height=64&width=64' },
  { name: 'Gifts', icon: '/placeholder.svg?height=64&width=64' },
];

export default function BrowseCategories() {
  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
      {categories.map(category => (
        <Link
          key={category.name}
          href={`/category/${category.name.toLowerCase()}`}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-16 h-16 flex items-center justify-center">
            <img
              src="/placeholder.svg?height=64&width=64"
              alt={category.name}
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <span className="text-sm font-medium text-center">{category.name}</span>
        </Link>
      ))}
    </div>
  );
}
