import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function compressImage(file: File, maxSizeBytes = 380 * 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        // Max dimension clamp to avoid massive canvases
        const MAX_DIMENSION = 1920
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width)
            width = MAX_DIMENSION
          } else {
            width = Math.round((width * MAX_DIMENSION) / height)
            height = MAX_DIMENSION
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Failed to get canvas context"))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)

        // Compression loop
        let quality = 0.9
        let dataUrl = canvas.toDataURL("image/jpeg", quality)

        // Simple binary search-ish or linear reduction
        while (dataUrl.length > maxSizeBytes && quality > 0.1) {
          quality -= 0.1
          dataUrl = canvas.toDataURL("image/jpeg", quality)
        }

        resolve(dataUrl)
      }
      img.onerror = (error) => reject(error)
    }
    reader.onerror = (error) => reject(error)
  })
}
