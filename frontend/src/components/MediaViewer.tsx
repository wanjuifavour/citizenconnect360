"use client"

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface MediaViewerProps {
  mediaItems: Array<{ url: string, type: string, id: number }>
  initialIndex: number
  isOpen: boolean
  onClose: () => void
  baseUrl?: string
}

export function MediaViewer({
  mediaItems,
  initialIndex = 0,
  isOpen,
  onClose,
  baseUrl = "http://localhost:8085"
}: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  if (!isOpen || mediaItems.length === 0) return null

  const currentItem = mediaItems[currentIndex]
  const fullUrl = `${baseUrl}${currentItem.url}`

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1))
  }

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1))
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
        >
          <X size={24} />
        </button>

        {currentItem.type === 'PHOTO' ? (
          <img
            src={fullUrl}
            alt="Media preview"
            className="max-w-full max-h-[85vh] object-contain"
          />
        ) : (
          <video
            src={fullUrl}
            controls
            autoPlay
            className="max-w-full max-h-[85vh]"
          />
        )}

        {mediaItems.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
            >
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
              {mediaItems.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}