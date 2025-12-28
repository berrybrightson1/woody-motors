"use server"

import { generateText } from "ai"

export async function generateCarCaption(details: {
  make: string
  model: string
  year: string
  price: string
  tone: "corporate" | "street"
}) {
  const { make, model, year, price, tone } = details

  const prompt =
    tone === "corporate"
      ? `Write a professional, high-end sales caption for a ${year} ${make} ${model} priced at $${price}. Focus on reliability, luxury, and prestige. Keep it under 60 words.`
      : `Write an energetic, hype-style "street" caption for a ${year} ${make} ${model} priced at $${price}. Use Nigerian/Lagos car dealer slang (like "Duty fully paid", "No stories", "Clear title"). Keep it punchy and engaging.`

  try {
    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Local fallback generator (since we don't have API keys configured)
    const templates = {
      corporate: [
        `Introducing the ${year} ${make} ${model}. A masterpiece of engineering offering unparalleled comfort and performance. This vehicle represents the pinnacle of luxury, currently listed at $${price}. Schedule your exclusive viewing today.`,
        `Experience distinction with this ${year} ${make} ${model}. Meticulously maintained and duty paid, it stands as a testament to automotive excellence. Available now for $${price}.`,
        `Elevate your drive with the ${year} ${make} ${model}. Combining sophisticated design with robust reliability. Verified history and ready for immediate acquisition at $${price}.`
      ],
      street: [
        `Omo! See this clean ${year} ${make} ${model}! 🚀 Duty fully paid, no stories. Engine is calculating, AC is chilling like Antarctica. Grab this machine for just $${price} before someone else moves fast!`,
        `Cleanest ${make} ${model} in town! ${year} spec, full option. Buy and drive, zero issues. Trust me, at $${price}, this is a giveaway. Call me now!`,
        `Fresh entry! ${year} ${make} ${model} just landed. Direct foreign used, accident-free. The sound alone will confuse your enemies. Going for $${price}. Don't snooze!`
      ]
    }

    const options = templates[tone]
    const text = options[Math.floor(Math.random() * options.length)]

    return { success: true, text }
  } catch (error) {
    console.error("[v0] AI generation error:", error)
    return { success: false, text: "Failed to generate caption. Please try again." }
  }
}
