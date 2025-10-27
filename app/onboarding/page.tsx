'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronRight, MapPin, ChefHat, Users, Calendar } from 'lucide-react'

const STEPS = [
  {
    icon: MapPin,
    emoji: '📍',
    title: 'Discover Nearby Events',
    description: 'Find potlucks, dinners, and cooking classes happening in your neighborhood',
  },
  {
    icon: Users,
    emoji: '👥',
    title: 'Connect Over Food',
    description: 'Meet new friends and build community through shared meals',
  },
  {
    icon: ChefHat,
    emoji: '🍳',
    title: 'Share Your Recipes',
    description: 'Host your own events and share your favorite dishes with others',
  },
  {
    icon: Calendar,
    emoji: '📅',
    title: 'Never Miss Out',
    description: 'Keep track of upcoming events and get reminders so you never miss a meal',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push('/home')
    }
  }

  const handleSkip = () => {
    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col">
      {/* Skip Button */}
      <div className="flex justify-end p-4">
        <button
          onClick={handleSkip}
          className="text-gray-600 font-medium"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="text-center max-w-sm"
        >
          <div className="text-6xl mb-8">{STEPS[currentStep].emoji}</div>
          <h1 className="text-3xl font-bold mb-4">{STEPS[currentStep].title}</h1>
          <p className="text-gray-600 text-lg mb-12">
            {STEPS[currentStep].description}
          </p>
        </motion.div>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {STEPS.map((_, index) => (
          <div
            key={index}
            className={`h-2 transition-all ${
              index === currentStep
                ? 'w-8 bg-primary-500'
                : 'w-2 bg-gray-300'
            } rounded-full`}
          />
        ))}
      </div>

      {/* Next Button */}
      <div className="p-8">
        <button
          onClick={handleNext}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {currentStep === STEPS.length - 1 ? "Let's Get Started" : 'Next'}
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}