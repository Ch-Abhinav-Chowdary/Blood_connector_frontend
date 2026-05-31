import { useEffect, useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import StatsSection from '@/components/landing/StatsSection'
import FindDonorsSection from '@/components/landing/FindDonorsSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import AboutSection from '@/components/landing/AboutSection'
import BloodCompatibilitySection from '@/components/landing/BloodCompatibilitySection'
import FooterSection from '@/components/landing/FooterSection'
import { homeAPI } from '@/services/api'

export default function LandingPage() {
  const [stats, setStats] = useState({
    registeredDonors: 0,
    livesSaved: 0,
    citiesCovered: 0,
    matchSuccessRate: 99,
    isLoading: true
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await homeAPI.getStats()
        const { registeredDonors, livesSaved, citiesCovered, matchSuccessRate } = response.data.data
        setStats({
          registeredDonors,
          livesSaved,
          citiesCovered,
          matchSuccessRate,
          isLoading: false
        })
      } catch (err) {
        console.error('Failed to fetch landing stats:', err.message)
        setStats(prev => ({ ...prev, isLoading: false }))
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="page-wrapper">
      <Navbar />
      <main>
        <HeroSection stats={stats} />
        <StatsSection stats={stats} />
        <FindDonorsSection />
        <HowItWorksSection />
        <AboutSection />
        <BloodCompatibilitySection />
        <FooterSection />
      </main>
    </div>
  )
}
