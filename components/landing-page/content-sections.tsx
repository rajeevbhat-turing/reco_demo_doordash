import { ArrowRight } from 'lucide-react';

export default function ContentSections() {
  return (
    <>
      {/* Content section 1 */}
      <div className="w-full max-w-7xl mx-auto px-6 pt-20 pb-[120px] md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Become a Dasher */}
          <div
            className="flex flex-row lg:flex-col items-start lg:items-center text-left lg:text-center max-w-[400px] 
          md:max-w-[450px] lg:max-w-[270px] mx-auto gap-8 md:gap-12 lg:gap-0"
          >
            <div className="mb-0 lg:mb-4 flex-shrink-0">
              <img
                src="/landing-page/dasher.png"
                alt="Dasher"
                width={154}
                height={154}
                className="w-auto h-auto max-w-[88px] max-h-[88px] md:max-w-[154px] md:max-h-[154px]"
              />
            </div>
            <div className="flex flex-col lg:items-center">
              <h2 className="text-3xl font-bold text-[#191919ff] mb-3">Become a Dasher</h2>
              <p className="text-[#191919ff] text-lg font-medium mb-3">
                As a delivery driver, make money and work on your schedule. Sign up in minutes.
              </p>
              <a
                href=""
                className="text-red-600 font-bold text-sm lg:text-lg flex items-center gap-1"
              >
                Start earning
                <ArrowRight className="h-4 w-4" strokeWidth={3} />
              </a>
            </div>
          </div>

          {/* Become a Merchant */}
          <div
            className="flex flex-row lg:flex-col items-start lg:items-center text-left lg:text-center max-w-[400px] 
          md:max-w-[450px] lg:max-w-[270px] mx-auto gap-8 md:gap-12 lg:gap-0"
          >
            <div className="mb-0 lg:mb-4 flex-shrink-0">
              <img
                src="/landing-page/merchant.png"
                alt="Merchant"
                width={154}
                height={154}
                className="w-auto h-auto max-w-[88px] max-h-[88px] md:max-w-[154px] md:max-h-[154px]"
              />
            </div>
            <div className="flex flex-col lg:items-center">
              <h2 className="text-3xl font-bold text-[#191919ff] mb-3">Become a Merchant</h2>
              <p className="text-[#191919ff] text-lg font-medium mb-3">
                Attract new customers and grow sales, starting with 0% commissions for up to 30
                days.
              </p>
              <a
                href=""
                className="text-red-600 font-bold text-sm lg:text-lg flex items-center gap-1"
              >
                Sign up for DashDoor
                <ArrowRight className="h-4 w-4" strokeWidth={3} />
              </a>
            </div>
          </div>

          {/* Get the best DashDoor experience */}
          <div
            className="flex flex-row lg:flex-col items-start lg:items-center text-left lg:text-center max-w-[400px] 
          md:max-w-[450px] lg:max-w-[270px] mx-auto gap-8 md:gap-12 lg:gap-0"
          >
            <div className="mb-0 lg:mb-4 flex-shrink-0">
              <img
                src="/landing-page/mobile.png"
                alt="Mobile app"
                width={154}
                height={154}
                className="w-auto h-auto max-w-[88px] max-h-[88px] md:max-w-[154px] md:max-h-[154px]"
              />
            </div>
            <div className="flex flex-col lg:items-center">
              <h2 className="text-3xl font-bold text-[#191919ff] mb-3">
                Get the best DashDoor experience
              </h2>
              <p className="text-[#191919ff] text-lg font-medium mb-3">
                Experience the best your neighborhood has to offer, all in one app.
              </p>
              <a
                href=""
                className="text-red-600 font-bold text-sm lg:text-lg flex items-center gap-1"
              >
                Get the app
                <ArrowRight className="h-4 w-4" strokeWidth={3} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content section 2 */}
      <div className="relative pb-0">
        <div className="w-full max-w-7xl mx-auto px-6 bg-[#fef1ee] md:bg-transparent">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 items-center">
            {/* Left column - Text content */}
            <div className="flex flex-col md:col-span-1 lg:col-span-1 order-2 md:order-1">
              <h2 className="text-2xl md:text-[40px] font-bold text-[#191919ff] md:mb-4 leading-[40px]">
                Everything you crave, delivered.
              </h2>
              <h3 className="text-lg md:text-xl font-bold text-[#191919ff] mb-2">
                Your favorite local restaurants
              </h3>
              <p className="text-sm md:text-base font-medium text-[#191919ff] mb-6">
                Get a slice of pizza or the whole pie delivered, or pick up house lo mein from the
                Chinese takeout spot you've been meaning to try.
              </p>
              <button
                className="bg-[#eb1700ff] text-white font-bold px-3 py-2 rounded-[28px] text-sm md:text-base 
              hover:bg-red-600 w-fit"
              >
                Find restaurants
              </button>
            </div>

            {/* Right column - Image */}
            <div className="w-full relative z-10 md:col-span-1 lg:col-span-2 order-1 md:order-2 -mt-10 md:mt-0">
              <img
                src="/landing-page/gallery-1.png"
                alt="Person enjoying delivered food outdoors"
                width={700}
                height={500}
                className="w-full h-[180px] md:h-[500px] md:w-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content section 3 */}
      <div className="bg-[#fef1ee] pt-10 md:pt-20 pb-6 lg:pt-24 relative z-0 md:-mt-10">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
            {/* Image - 1 column on md, 2 columns on lg */}
            <div className="w-full relative z-10 md:col-span-1 lg:col-span-2">
              <img
                src="/landing-page/gallery-2.png"
                alt="DashPass food items"
                width={700}
                height={500}
                className="w-full h-[180px] md:h-[500px] md:w-auto object-cover"
              />
            </div>

            {/* Text content - 1 column on both md and lg */}
            <div className="flex flex-col md:col-span-1 lg:col-span-1">
              <h2 className="text-2xl md:text-[40px] font-bold text-[#191919ff] mb-2 md:mb-4 leading-tight">
                DashPass is delivery for less
              </h2>
              <p className="text-sm md:text-base font-medium text-[#191919ff] mb-6">
                Members get a $0 delivery fee on DashPass orders, 5% back on pickup orders, and so
                much more. Plus, it's free for 30 days.
              </p>
              <button
                className="bg-[#eb1700ff] text-white font-bold px-3 py-2 rounded-[28px] text-sm md:text-base 
              hover:bg-red-600 w-fit"
              >
                Get DashPass
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content section 6 */}
      <div className="bg-[#fef1ee] py-10 md:-mt-6 md:pt-20 md:pb-10">
        <div className="w-full max-w-7xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#191919ff] mb-12 max-w-[320px] md:max-w-[450px] mx-auto">
            Helping you with to-dos and gifting
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Item 1: Beauty essentials */}
            <div className="flex flex-col items-center text-center">
              <div className="w-full mb-4">
                <img
                  src="/landing-page/gallery-5.png"
                  alt="Beauty essentials"
                  width={600}
                  height={400}
                  className="w-full h-[180px] md:h-auto object-cover"
                />
              </div>
              <h3 className="text-2xl md:text-[40px] font-bold text-[#191919ff] mb-2 md:mb-3 leading-[40px]">
                Beauty essentials from top brands
              </h3>
              <p className="text-sm md:text-base font-medium text-[#191919ff] mb-4">
                Get all your beauty and self-care needs delivered at home or on-the-go
              </p>
              <button
                className="bg-[#eb1700ff] text-white font-bold px-3 py-2 rounded-[28px] text-sm md:text-base 
              hover:bg-red-600 w-fit"
              >
                Shop beauty
              </button>
            </div>

            {/* Item 2: Flowers */}
            <div className="flex flex-col items-center text-center">
              <div className="w-full mb-4">
                <img
                  src="/landing-page/gallery-6.png"
                  alt="Flowers"
                  width={600}
                  height={400}
                  className="w-full h-[180px] md:h-auto object-cover"
                />
              </div>
              <h3 className="text-2xl md:text-[40px] font-bold text-[#191919ff] mb-2 md:mb-3 leading-[40px]">
                Flowers for any occasion
              </h3>
              <p className="text-sm md:text-base font-medium text-[#191919ff] mb-4">
                Shop hand-picked and thoughtfully-arranged blooms from florists near you.
              </p>
              <button
                className="bg-[#eb1700ff] text-white font-bold px-3 py-2 rounded-[28px] text-sm md:text-base 
              hover:bg-red-600 w-fit"
              >
                Send Flowers
              </button>
            </div>

            {/* Item 3: Restock the minibar */}
            <div className="flex flex-col items-center text-center">
              <div className="w-full mb-4">
                <img
                  src="/landing-page/gallery-7.png"
                  alt="Restock the minibar"
                  width={600}
                  height={400}
                  className="w-full h-[180px] md:h-auto object-cover"
                />
              </div>
              <h3 className="text-2xl md:text-[40px] font-bold text-[#191919ff] mb-2 md:mb-3 leading-[40px]">
                Restock the minibar
              </h3>
              <p className="text-sm md:text-base font-medium text-[#191919ff] mb-4">
                Hosting a get-together or need a special cocktail ingredient? Get liquor, beer,
                mixers, champagne and wine delivered fast.*
              </p>
              <button
                className="bg-[#eb1700ff] text-white font-bold px-3 py-2 rounded-[28px] text-sm md:text-base 
              hover:bg-red-600 w-fit mb-3"
              >
                Shop Alcohol
              </button>
              <p className="text-xs md:text-sm font-medium text-[#191919ff]">
                *Must be 21+. Enjoy responsibly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* White bg on small screens */}
      <div className="w-full h-[180px] md:h-0 md:w-0"></div>

      {/* Content section 7 */}
      <div className="relative pb-0">
        <div className="w-full max-w-7xl mx-auto px-6 md:pt-16 bg-[#fef1ee] md:bg-transparent relative">
          <div className="relative -top-[140px] md:top-0 mb-[-140px] md:mb-0">
            <h2
              className="text-2xl md:text-3xl font-bold text-center text-[#191919ff] mb-8 md:mb-12 max-w-[320px] 
            md:max-w-[450px] mx-auto"
            >
              Unlocking opportunity for Dashers and businesses
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 items-center">
              {/* Left column - Text content */}
              <div className="flex flex-col md:col-span-1 lg:col-span-1 order-2 md:order-1">
                <h2 className="text-2xl md:text-[40px] font-bold text-[#191919ff] md:mb-4 leading-[40px]">
                  Sign up to dash and get paid
                </h2>
                <p className="text-sm md:text-base font-medium text-[#191919ff] mb-6">
                  Deliver with the #1 Food and Drink App in the U.S. As a delivery driver, you'll
                  make money and work on your schedule. Sign up in minutes.
                </p>
                <button
                  className="bg-[#eb1700ff] text-white font-bold px-3 py-2 rounded-[28px] text-sm md:text-base 
              hover:bg-red-600 w-fit"
                >
                  Become a Dasher
                </button>
              </div>

              {/* Right column - Image */}
              <div className="w-full relative z-10 md:col-span-1 lg:col-span-2 order-1 md:order-2">
                <img
                  src="/landing-page/gallery-9.png"
                  alt="Dasher delivery driver"
                  width={700}
                  height={500}
                  className="w-full h-[180px] md:h-[500px] md:w-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content section 8 */}
      <div className="bg-[#fef1ee] pt-10 md:pt-20 pb-6 lg:pt-24 relative z-0 md:-mt-10">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
            {/* Image - 1 column on md, 2 columns on lg */}
            <div className="w-full relative z-10 md:col-span-1 lg:col-span-2">
              <img
                src="/landing-page/gallery-10.png"
                alt="Business partner"
                width={700}
                height={500}
                className="w-full h-[180px] md:h-[500px] md:w-auto object-cover"
              />
            </div>

            {/* Text content - 1 column on both md and lg */}
            <div className="flex flex-col md:col-span-1 lg:col-span-1">
              <h2 className="text-2xl md:text-[40px] font-bold text-[#191919ff] mb-2 md:mb-4 leading-tight">
                Grow your business with DashDoor
              </h2>
              <p className="text-sm md:text-base font-medium text-[#191919ff] mb-6">
                Businesses large and small partner with DashDoor to reach new customers, increase
                order volume, and drive more sales.
              </p>
              <button
                className="bg-[#eb1700ff] text-white font-bold px-3 py-2 rounded-[28px] text-sm md:text-base 
              hover:bg-red-600 w-fit"
              >
                Become a Partner
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
