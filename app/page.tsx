'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronDown, ChevronUp, Star, Search } from 'lucide-react';
import AuthenticationModal from '@/components/modals/authentication-modal';
import { DashDoorLogoMark, DashDoorWordMark } from '@/components/common/Icons';
import { topCities } from '@/constants/top-cities';
import { topCuisines } from '@/constants/top-cuisines';
import { topChains } from '@/constants/top-chains';

export default function LandingPage() {
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'cities' | 'cuisines' | 'chains'>('cities');
  const [showAllCities, setShowAllCities] = useState(false);
  const [imageOffset, setImageOffset] = useState(0);

  useEffect(() => {
    let ticking = false;

    // Handles scroll events to toggle header visibility based on scroll position
    const handleScroll = () => {
      if (!ticking) {
        const vw = window.innerWidth;
        window.requestAnimationFrame(() => {
          setIsScrolled(vw < 768 ? window.scrollY > 150 : window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Calculates image offset based on viewport width
    const calculateOffset = () => {
      const vw = window.innerWidth;
      // As viewport gets smaller, increase the offset (move images further out)
      const offset = Math.max(0, (1920 - vw) * (vw < 768 ? 0.25 : 0.3));
      setImageOffset(offset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', calculateOffset, { passive: true });
    calculateOffset(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', calculateOffset);
    };
  }, []);

  return (
    <div className="bg-white">
      {/* App Banner - Mobile Only */}
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

      {/* Transparent Header (at top) */}
      <div
        className={`w-full bg-transparent relative top-0 left-0 right-0 z-20 px-6 flex items-center justify-center h-16 
          transition-opacity duration-200 ${
            isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
      >
        <div className="items-center justify-center gap-2.5 hidden md:flex">
          <DashDoorLogoMark color="#fff" width={42} height={24} />
          <DashDoorWordMark color="#fff" width={155} height={18} />
        </div>

        {/* Sign in / Sign up */}
        <div className="absolute right-6 top-0 bottom-0 items-center gap-2 hidden md:flex">
          <button
            onClick={() => setAuthModalMode('signin')}
            className="bg-[#d91400ff] text-white text-lg font-bold px-3 py-2 hover:bg-red-700 rounded-[28px]"
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthModalMode('signup')}
            className="bg-white text-[#606060ff] text-lg font-bold px-3 py-2 hover:bg-gray-100 rounded-[28px]"
          >
            Sign Up
          </button>
        </div>

        {/* Login / Open App buttons */}
        <div className="absolute right-6 top-0 bottom-0 items-center gap-2 flex md:hidden">
          <button
            onClick={() => setAuthModalMode('signin')}
            className="bg-white text-[#606060ff] font-bold text-base px-3 py-2 hover:bg-gray-100 rounded-[28px]"
          >
            Login
          </button>
          <button className="bg-[#d91400ff] text-white text-base font-bold px-3 py-2 hover:bg-red-700 rounded-[28px]">
            Open App
          </button>
        </div>
      </div>

      {/* Fixed White Header (on scroll) */}
      <div
        className={`w-full bg-white fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-2 h-[72px] md:h-[50px] border-b 
          border-gray-200 shadow-sm transition-opacity duration-200 ${
            isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      >
        {/* Desktop: Logo */}
        <div className="items-center gap-2 hidden md:flex">
          <DashDoorLogoMark width={32} height={18} />
          <div className="hidden lg:block">
            <DashDoorWordMark width={112} height={15} />
          </div>
        </div>

        {/* Mobile: Address Input Button */}
        <div className="flex-1 flex md:hidden px-2">
          <div className="w-full rounded-full px-3.5 py-1.5 flex items-center gap-3 border border-gray-200">
            <Search className="w-5 h-6 text-[#191919ff] flex-shrink-0" />
            <span className="text-base font-medium text-[#606060ff] flex-1 text-left cursor-text">
              Enter delivery address
            </span>
            <div className="w-10 h-10 bg-[#eb1700ff] rounded-full flex items-center justify-center flex-shrink-0">
              <ArrowRight className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Desktop: Sign in / Sign up */}
        <div className="items-center gap-2 hidden md:flex">
          <button
            onClick={() => setAuthModalMode('signin')}
            className="bg-[#eb1700ff] text-white text-lg font-bold px-3 py-1.5 hover:bg-red-600 rounded-[28px]"
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthModalMode('signup')}
            className="text-[#606060ff] font-bold px-3 py-2 rounded-[28px]"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile: Login / Open App buttons */}
        <div className="flex items-center gap-2 md:hidden px-2">
          <button
            onClick={() => setAuthModalMode('signin')}
            className="bg-white text-[#606060ff] font-bold text-base px-3 py-3.5 rounded-[28px]"
          >
            Login
          </button>
          <button className="bg-[#d91400ff] text-white text-base font-bold px-3 py-3.5 hover:bg-red-700 rounded-[28px]">
            Open App
          </button>
        </div>
      </div>

      {/* Top section */}
      <div className="bg-[#2f477f] h-[650px] relative flex flex-col items-center justify-center mt-[-64px] overflow-hidden">
        {/* Left image banner */}
        <div className="absolute top-0 bottom-0" style={{ left: `-${imageOffset}px` }}>
          <Image
            src="/landing-page/food-image-1.png"
            alt="Landing page left banner"
            width={500}
            height={500}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right image banner */}
        <div className="absolute top-0 bottom-0" style={{ right: `-${imageOffset}px` }}>
          <Image
            src="/landing-page/food-image-2.png"
            alt="Landing page right banner"
            width={500}
            height={500}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-col items-center justify-center max-w-[320px] mx-auto md:max-w-none text-center">
          <div className="flex items-center justify-center gap-2 mb-4 md:hidden">
            <DashDoorLogoMark width={32} height={18} color="#fff" />
            <DashDoorWordMark width={112} height={15} color="#fff" />
          </div>
          <h1 className="text-white text-3xl md:text-[40px] font-black">
            $0 DELIVERY FEE ON FIRST ORDER
          </h1>
          <span className="text-white text-xs font-semibold">Other fees may apply</span>
        </div>
      </div>

      {/* App Promo Card - Mobile Only */}
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

      {/* Content section 1 */}
      <div className="w-full max-w-7xl mx-auto px-6 pt-20 pb-[120px] md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Become a Dasher */}
          <div
            className="flex flex-row lg:flex-col items-start lg:items-center text-left lg:text-center max-w-[400px] 
          md:max-w-[450px] lg:max-w-[270px] mx-auto gap-8 md:gap-12 lg:gap-0"
          >
            <div className="mb-0 lg:mb-4 flex-shrink-0">
              <Image
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
              <Image
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
              <Image
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
              <Image
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
              <Image
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

      {/* Content section 4 */}
      <div className="relative w-full">
        <div className="relative w-full h-[350px] md:h-[600px] flex items-center justify-center">
          {/* Background Image */}
          <Image
            src="/landing-page/gallery-3.png"
            alt="Grocery items"
            fill
            className="object-cover"
            priority
          />

          {/* Black Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Overlay Text Content */}
          <div className="px-6 relative z-10 mt-8">
            <div className="max-w-[550px] text-white text-center">
              <h2 className="text-2xl md:text-[40px] font-bold mb-4">
                Get grocery and convenience store essentials
              </h2>
              <h3 className="text-lg md:text-[20px] font-bold mb-2">
                Grocery delivery, exactly how you want it.
              </h3>
              <p className="text-sm md:text-base font-medium mb-8">
                Shop from home and fill your cart with fresh produce, frozen entrees, deli delights
                and more.
              </p>
              <button className="bg-[#eb1700ff] text-white font-bold px-3 py-2 rounded-[28px] text-sm md:text-base hover:bg-red-600 w-fit">
                Shop Groceries
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content section 5 */}
      <div className="relative pb-0">
        <div className="w-full max-w-7xl mx-auto px-6 pt-16 pb-6 md:pb-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 items-center">
            {/* Left column - Text content */}
            <div className="flex flex-col md:col-span-1 lg:col-span-1 order-2 md:order-1 ml-10 md:ml-0">
              <h2 className="text-2xl md:text-[40px] font-bold text-[#191919ff] md:mb-4 leading-[40px]">
                Convenience stores at your doorstep
              </h2>
              <p className="text-sm md:text-base font-medium text-[#191919ff] mb-6">
                Stock up on snacks, household essentials, candy, or vitamins – all delivered in
                under an hour.
              </p>
              <button
                className="bg-[#eb1700ff] text-white font-bold px-3 py-2 rounded-[28px] text-sm md:text-base 
              hover:bg-red-600 w-fit"
              >
                Shop Now
              </button>
            </div>

            {/* Right column - Image */}
            <div className="w-full relative z-10 md:col-span-1 lg:col-span-2 order-1 md:order-2 -mt-10 md:mt-0">
              <Image
                src="/landing-page/gallery-4.png"
                alt="Convenience store items"
                width={700}
                height={500}
                className="w-full h-[180px] md:h-[500px] md:w-auto object-cover"
              />
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
                <Image
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
                <Image
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
                <Image
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

            {/* Item 4: Pet supplies */}
            <div className="flex flex-col items-center text-center">
              <div className="w-full mb-4">
                <Image
                  src="/landing-page/gallery-8.png"
                  alt="Pet supplies"
                  width={600}
                  height={400}
                  className="w-full h-[180px] md:h-auto object-cover"
                />
              </div>
              <h3 className="text-2xl md:text-[40px] font-bold text-[#191919ff] mb-2 md:mb-3 leading-[40px]">
                What your pets need, and want
              </h3>
              <p className="text-sm md:text-base font-medium text-[#191919ff] mb-4">
                Finally, something cat people and dog people agree on – pet supplies delivery. Shop
                pet food, chew toys, and even costumes.
              </p>
              <button
                className="bg-[#eb1700ff] text-white font-bold px-3 py-2 rounded-[28px] text-sm md:text-base 
              hover:bg-red-600 w-fit"
              >
                Get Pet Supplies
              </button>
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
                <Image
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
              <Image
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

      {/* Get more from your neighborhood section */}
      <div className="w-full bg-white py-12">
        <div className="w-full max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#191919ff] mb-6">
            Get more from your neighborhood
          </h2>

          {/* Tabs */}
          <div className="grid grid-cols-3 mb-6 border-b border-gray-200 w-full">
            <button
              onClick={() => setActiveTab('cities')}
              className={`py-2 text-base transition-colors border-b-[3px] hover:bg-gray-50 ${
                activeTab === 'cities'
                  ? 'text-[#191919ff] border-[#191919ff] font-bold'
                  : 'text-[#606060ff] font-medium border-transparent'
              }`}
            >
              Top Cities
            </button>
            <button
              onClick={() => setActiveTab('cuisines')}
              className={`py-2 text-base transition-colors border-b-[3px] hover:bg-gray-50 ${
                activeTab === 'cuisines'
                  ? 'text-[#191919ff] border-[#191919ff] font-bold'
                  : 'text-[#606060ff] font-medium border-transparent'
              }`}
            >
              Top Cuisines
            </button>
            <button
              onClick={() => setActiveTab('chains')}
              className={`py-2 text-base transition-colors border-b-[3px] hover:bg-gray-50 ${
                activeTab === 'chains'
                  ? 'text-[#191919ff] border-[#191919ff] font-bold'
                  : 'text-[#606060ff] font-medium border-transparent'
              }`}
            >
              Top Chains
            </button>
          </div>

          {/* Content */}
          <div className="mb-8">
            {activeTab === 'cities' && (
              <div>
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${
                    !showAllCities ? 'mb-6' : ''
                  }`}
                >
                  {(showAllCities ? topCities : topCities.slice(0, 15)).map((city, index) => (
                    <div
                      key={`city-${index}`}
                      className="text-base font-medium text-[#191919ff] hover:underline"
                    >
                      {city}
                    </div>
                  ))}
                </div>
                {topCities.length > 15 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex items-center gap-2 text-[#191919ff]">
                      {showAllCities ? (
                        <>
                          <span className="font-bold text-xl">See less</span>
                          <button
                            className="flex items-center justify-center p-2.5 rounded-full bg-[#f1f1f1] hover:bg-gray-200"
                            onClick={() => setShowAllCities(false)}
                          >
                            <ChevronUp className="h-5 w-5" strokeWidth={2} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-xl">See more</span>
                          <button
                            className="flex items-center justify-center p-2.5 rounded-full bg-[#f1f1f1] hover:bg-gray-200"
                            onClick={() => setShowAllCities(true)}
                          >
                            <ChevronDown className="h-5 w-5" strokeWidth={2} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cuisines' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {topCuisines.map((cuisine, index) => (
                  <div
                    key={`cuisine-${index}`}
                    className="text-base font-medium text-[#191919ff] hover:underline"
                  >
                    {cuisine}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'chains' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {topChains.map((chain, index) => (
                  <div
                    key={`chain-${index}`}
                    className="text-base font-medium text-[#191919ff] hover:underline"
                  >
                    {chain}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      {authModalMode && (
        <AuthenticationModal onClose={() => setAuthModalMode(null)} defaultMode={authModalMode} />
      )}
    </div>
  );
}
