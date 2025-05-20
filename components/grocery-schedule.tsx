import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

// Default promo banners (fallback)
const defaultPromos = [
  {
    id: "1",
    title: "Save big on dairy products from select Safeway brands",
    description: "Shop eggs, milk, yogurt and more!",
    buttonText: "Shop now",
    backgroundColor: "#f7f3e8",
    buttonColor: "bg-[#eb1800] hover:bg-[#cf1600]",
    textColor: "text-black",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/757d11c9-3d97-41d8-9fe0-e1cc4ff46294-retina-large.png",
    logoImage: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/Screen_Shot_2021-01-22_at_1.31.06_PM_230x230.png"
  },
  {
    id: "2",
    title: "Take 25% off orders of $65+ at Gus's. Up to $30 off.",
    description: "Code: GUS25. Now - 6/30",
    buttonText: "Order now",
    backgroundColor: "#fcee21",
    buttonColor: "bg-[#00723B] hover:bg-[#00612e]",
    textColor: "text-black",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/1531ea13-c071-4cf6-9b73-be9d4a650e28-retina-large.png",
    logoImage: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/store/cover/7a4b5bb4-cacd-4d14-b21d-32d1d865d223.jpg"
  }
];

interface PromoData {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  backgroundColor: string;
  buttonColor: string;
  textColor: string;
  image: string;
  logoImage?: string;
}

interface GroceryScheduleProps {
  data?: {
    title: string;
    description: string;
    buttonText: string;
    stores: Array<{
      name: string;
      logo: string;
    }>;
  };
  promos?: PromoData[];
}

export default function GrocerySchedule({ data, promos = defaultPromos }: GroceryScheduleProps) {
  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promos.map((promo) => (
          <div 
            key={promo.id} 
            className="rounded-lg overflow-hidden flex"
            style={{ backgroundColor: promo.backgroundColor }}
          >
            <div className="p-6 flex-1">
              {promo.logoImage && (
                <div className="mb-2 w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Image 
                    src={promo.logoImage} 
                    alt="Logo" 
                    width={24} 
                    height={24} 
                    className="object-contain" 
                  />
                </div>
              )}
              <h2 className={`text-xl font-bold mb-2 ${promo.textColor}`}>{promo.description}</h2>
              <p className={`text-sm mb-4 ${promo.textColor}`}>
                {promo.title}
              </p>
              <Button className={`rounded-full text-white ${promo.buttonColor}`}>
                {promo.buttonText}
              </Button>
            </div>
            <div className="relative w-1/2 hidden md:block">
              <Image 
                src={promo.image} 
                alt={promo.title} 
                fill
                className="object-cover" 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}