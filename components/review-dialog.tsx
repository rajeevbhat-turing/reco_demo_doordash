"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Star, Info } from "lucide-react"

interface ReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  restaurantName: string
}

export default function ReviewDialog({ isOpen, onClose, restaurantName }: ReviewDialogProps) {
  const [rating, setRating] = useState<number>(0)
  const [reviewText, setReviewText] = useState<string>("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"

      // Add event listener for Escape key
      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose()
        }
      }

      document.addEventListener("keydown", handleEscapeKey)

      // Focus the textarea when the dialog opens
      if (textareaRef.current) {
        setTimeout(() => {
          textareaRef.current?.focus()
        }, 100)
      }

      return () => {
        document.body.style.overflow = "auto"
        document.removeEventListener("keydown", handleEscapeKey)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewText(e.target.value)
  }

  const handleSubmit = () => {
    // Here you would typically send the review to your backend
    console.log("Submitting review:", { rating, reviewText })
    onClose()
  }

  const isSubmitDisabled = reviewText.length < 10 || rating === 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={dialogRef} className="relative bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <button onClick={onClose} className="absolute top-6 left-6" aria-label="Close dialog">
            <X className="h-6 w-6 text-gray-500" />
          </button>

          <h2 className="text-3xl font-bold text-center mb-4 mt-6">Add a Public Review</h2>
          <h3 className="text-xl text-gray-600 mb-6">{restaurantName}</h3>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-medium">Prajjwal S.</div>
              <div className="flex items-center bg-gray-200 rounded-lg px-3 py-1">
                <span className="mr-1">Everyone</span>
                <Info className="h-5 w-5 text-gray-500" />
              </div>
            </div>

            <div className="flex mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer ${
                    star <= rating ? "fill-gray-700 text-gray-700" : "text-gray-300"
                  }`}
                  onClick={() => handleRatingChange(star)}
                />
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={reviewText}
              onChange={handleTextChange}
              placeholder="Write a review, it's helpful to include details about taste, quality, and portions."
              className="w-full p-4 border border-gray-300 rounded-lg focus:border-gray-500 focus:ring-0 focus:outline-none min-h-[150px]"
            />

            <div className="text-gray-500 mt-2">Min characters: 10</div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className={`px-8 py-3 rounded-full text-white font-medium ${
                isSubmitDisabled ? "bg-gray-300" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
