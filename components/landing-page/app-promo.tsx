import { Star } from 'lucide-react';
import { DashDoorLogoMark } from '@/components/common/Icons';

export default function AppPromo() {
  return (
    <div className="w-full px-4 pt-6 md:hidden">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-[#f7f7f7ff] rounded-xl shadow-sm p-4 flex flex-col gap-4 border border-[#f5f5f5] max-w-[400px] mx-auto">
          {/* Top Section: Icon and Text */}
          <div className="flex items-start gap-3">
            {/* App Icon */}
            <div className="flex-shrink-0">
              <div className="w-[60px] h-[60px] rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                <DashDoorLogoMark width={44} height={20} />
              </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[#191919ff]">Browse faster in the app</h3>
              <p className="text-sm text-[#606060ff] font-medium mb-1">
                $0 delivery fee on first order
              </p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className="w-3 h-3 fill-yellow-400 text-yellow-400"
                    fill="currentColor"
                  />
                ))}
                <span className="text-sm font-medium text-[#606060ff] ml-1">20M ratings</span>
              </div>
            </div>
          </div>

          {/* Button */}
          <button className="w-full bg-[#eb1700ff] text-white font-bold text-base py-2 rounded-[28px] hover:bg-red-600">
            Continue in app
          </button>
        </div>
      </div>
    </div>
  );
}
