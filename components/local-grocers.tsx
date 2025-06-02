import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LocalGrocers() {
  return (
    <div className="py-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Your Local Grocers</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative h-36 rounded-lg overflow-hidden bg-gradient-to-r from-amber-50 to-amber-100">
          <Image 
            src="/placeholder.svg?height=150&width=300" 
            alt="Local grocers" 
            fill
            className="object-cover" 
          />
        </div>
      </div>
    </div>
  );
}