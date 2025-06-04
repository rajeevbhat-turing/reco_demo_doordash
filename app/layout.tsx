import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { ReplaceCartProvider } from "@/context/replace-cart-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DashDoor: Food Delivery & Takeaway",
  description: "Order food online from restaurants and get it delivered to your door",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReplaceCartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1 relative">
              <Sidebar />
              <div className="flex-1 w-0 min-w-0 md:ml-[220px]">
                <main className="flex-1">{children}</main>
              </div>
            </div>
          </div>
        </ReplaceCartProvider>
      </body>
    </html>
  )
}
