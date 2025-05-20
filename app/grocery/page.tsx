import FilterOptions from "@/components/filter-options"
import GrocerySchedule from "@/components/grocery-schedule"
import GroceryEssentials from "@/components/grocery-essentials"
import GroceryFavorites from "@/components/grocery-favorites"
import FastestNearYou from "@/components/fastest-near-you"
import LocalGrocers from "@/components/local-grocers"
import ProductCarousel from "@/components/product-carousel"
import {
  getFilterOptions,
  getAllStores,
  getGroceryScheduleData,
  getGroceryEssentialsData,
  getGroceryFavorites,
  getFastestNearYou,
  getProductCarouselData
} from "@/app/grocery/data/retail-response-mapper"
import GroceryAllStores from "@/components/grocery-all-stores";

export default function Grocery() {
  // Get the data from our retail response mapper
  const filterOptions = getFilterOptions();
  const stores = getAllStores();
  const scheduleData = getGroceryScheduleData();
  const essentialsData = getGroceryEssentialsData();
  const favoriteStores = getGroceryFavorites();
  const fastestStores = getFastestNearYou();
  const productCarousels = getProductCarouselData();

  return (
    <div className="max-w-[1200px] mx-auto px-4 pt-16">
      {/* Filter Options Bar */}
      <FilterOptions isGrocery={true} filterData={filterOptions} />

      {/* Promotional Banners */}
      <GrocerySchedule data={scheduleData} />

      {/* All Stores Section */}
      <GroceryAllStores stores={stores} />

      {/* Pricing and Fees Link */}
      <div className="mt-4 text-sm text-gray-600">
        <a href="#" className="hover:underline">
          Pricing and Fees
        </a>
      </div>

      {/* Grocery Favorites Section */}
      <GroceryFavorites stores={favoriteStores} />

      {/* Fastest Near You Section */}
      <FastestNearYou stores={fastestStores} />

      {/* Product Carousels */}
      {productCarousels && (
        <>
          <ProductCarousel
            title={productCarousels.snacks.title}
            storeName={productCarousels.snacks.storeName}
            storeImage={productCarousels.snacks.storeImage}
            time={productCarousels.snacks.time}
            products={productCarousels.snacks.products}
          />

          <ProductCarousel
            title={productCarousels.market.title}
            storeName={productCarousels.market.storeName}
            storeImage={productCarousels.market.storeImage}
            time={productCarousels.market.time}
            products={productCarousels.market.products}
            isSnapEligible={productCarousels.market.isSnapEligible}
          />
        </>
      )}
        {/* Local Grocers Section */}
        <LocalGrocers />

      {/* Grocery Essentials Section */}
      {/*<GroceryEssentials data={essentialsData} />*/}
    </div>
  )
}
