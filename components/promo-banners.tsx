import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft } from "lucide-react"

export default function PromoBanners() {
  return (
    <div className="relative py-4">
      <div className="flex gap-4 overflow-hidden">
        <div className="flex-1 min-w-[400px] bg-[#f2eaff] rounded-lg overflow-hidden relative">
          <div className="p-6 max-w-[60%]">
            <h3 className="text-xl font-bold mb-2">Get 2,000 bonus Velocity Points + 1 Point per $1 spent*</h3>
            <p className="text-sm mb-4">
              Link Velocity account to start earning on eligible orders. Bonus Points offer ends 12/8. For full terms:
              <a href="http://www.doordash.com/velocity" className="text-[#ff3008]">
                www.doordash.com/velocity
              </a>
            </p>
            <Button className="bg-[#ff3008] hover:bg-[#e02b07] text-white rounded-full">Link now</Button>
          </div>
          <div className="absolute right-0 top-0 h-full w-[40%]">
            <div className="relative h-full w-full">
              <Image src="/placeholder.svg?height=200&width=200" alt="Velocity" fill className="object-cover" />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-[400px] bg-[#ff3008] rounded-lg overflow-hidden relative">
          <div className="p-6 max-w-[60%] text-white">
            <h3 className="text-xl font-bold mb-2">
              $15 Hunger Tamers for new DoorDash customers only. Use code: NEWHJ
            </h3>
            <p className="text-sm mb-4">Ends 30/6/25 or until max redemptions. 1 per customer. Fees apply.</p>
            <Button className="bg-white hover:bg-gray-100 text-black rounded-full">Order now</Button>
          </div>
          <div className="absolute right-0 top-0 h-full w-[40%]">
            <div className="relative h-full w-full">
              <Image src="/placeholder.svg?height=200&width=200" alt="Hungry Jacks" fill className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
