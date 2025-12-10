import { Star } from 'lucide-react';
import { DashDoorLogoMark } from '@/components/common/Icons';

export default function AppBanner() {
  return (
    <div className="w-full bg-white md:hidden">
      <div className="w-full max-w-7xl mx-auto px-4 pb-3 pt-5 flex items-center justify-between gap-4">
        {/* Left: App Icon and Text */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* App Icon */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center border border-gray-200">
              <DashDoorLogoMark width={54} height={30} />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="text-base font-bold text-[#191919ff] truncate">
              Browse faster in the app
            </h3>
            <p className="text-sm text-[#606060ff] font-medium truncate">
              $0 delivery fee on first order
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map(star => (
                <Star
                  key={star}
                  className="w-3 h-3 fill-yellow-400 text-yellow-400"
                  fill="currentColor"
                />
              ))}
              {/* Half star */}
              <div className="relative w-4 h-4">
                <Star className="w-4 h-4 text-yellow-400 absolute" fill="transparent" />
                <div className="absolute overflow-hidden w-2 h-4">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" fill="currentColor" />
                </div>
              </div>
              <span className="text-sm font-medium text-[#606060ff] ml-1">20M ratings</span>
            </div>
          </div>
        </div>

        {/* Right: Open Button */}
        <button className="bg-[#eb1700ff] text-white font-bold text-base px-3 py-1 rounded-[28px] flex-shrink-0 hover:bg-red-600">
          Open
        </button>
      </div>
    </div>
  );
}
