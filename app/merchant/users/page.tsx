'use client'
import { useState } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { Search, ChevronRight, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"

interface User {
  role: string
  email: string
  firstName: string
  lastName: string
}

export default function MerchantUsersPage() {
  const [searchValue, setSearchValue] = useState("")
  
  // Sample user data - matching the screenshot
  const users: User[] = [
    {
      role: "Business Admin",
      email: "kkapoor@bombaycafe.com",
      firstName: "Kira",
      lastName: "Kapoor"
    }
  ]

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.role.toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <MerchantLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 pr-3 py-2 w-64 border border-gray-300 rounded-md text-sm"
            />
          </div>
          {/* Add User Button */}
          <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 font-medium transition-colors">
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden border border-gray-200 rounded-lg bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Role</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Email</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">First Name</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Last Name</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr 
                  key={index} 
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-gray-900">{user.role}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-gray-600">{user.firstName}</td>
                  <td className="px-4 py-3 text-gray-600">{user.lastName}</td>
                  <td className="px-4 py-3">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </MerchantLayout>
  )
}

