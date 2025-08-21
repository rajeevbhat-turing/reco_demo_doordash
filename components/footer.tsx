import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-12 pt-8 pb-6">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Get to Know Us</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Investors
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Company Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Merchant Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Gift Cards
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Package Pickup
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Promotions
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Dasher Central
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Glassdoor
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Accessibility
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Newsroom
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Let Us Help You</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Account Details
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Order History
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Help
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Doing Business</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Become a Dasher
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  DashDoor Merchant
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Get Dashers for Deliveries
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  Get DashDoor for Business
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-4">
              <Link href="#" className="inline-block">
                <Image
                  src="/placeholder.svg?height=60&width=180"
                  alt="Download on the App Store"
                  width={180}
                  height={60}
                  className="rounded-lg"
                />
              </Link>
            </div>
            <div>
              <Link href="#" className="inline-block">
                <Image
                  src="/placeholder.svg?height=60&width=180"
                  alt="Get it on Google Play"
                  width={180}
                  height={60}
                  className="rounded-lg"
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Link href="/" className="text-[#2563EB] font-bold text-2xl tracking-tight mr-6">
                DASHDOOR
              </Link>
              <div className="flex space-x-4 text-sm text-gray-600">
                <Link href="#" className="hover:text-gray-900">
                  Terms of Service
                </Link>
                <Link href="#" className="hover:text-gray-900">
                  Privacy
                </Link>
                <Link href="#" className="hover:text-gray-900">
                  Delivery Locations
                </Link>
                <Link href="#" className="hover:text-gray-900">
                  Do Not Sell or Share My Personal Information
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-600">© 2025 DashDoor</span>
              <div className="flex space-x-3">
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  <Facebook size={20} />
                </Link>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  <Twitter size={20} />
                </Link>
                <Link href="#" className="text-gray-600 hover:text-gray-900">
                  <Instagram size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
