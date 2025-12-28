"use client"

import { useEffect, useRef, useState } from "react"

export function useScrollAnimation() {
    const ref = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.1 }
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => observer.disconnect()
    }, [])

    return { ref, isVisible }
}

export function ScrollReveal({
    children,
    className = "",
    delay = 0,
}: {
    children: React.ReactNode
    className?: string
    delay?: number
}) {
    const { ref, isVisible } = useScrollAnimation()

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
            }}
        >
            {children}
        </div>
    )
}
