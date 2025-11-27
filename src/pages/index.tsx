import Head from 'next/head'
import { useState } from 'react'
import { motion } from 'framer-motion'
import SajuForm from '@/components/SajuForm'
import SajuResult from '@/components/SajuResult'
import TodayFortune from '@/components/TodayFortune'
import Navigation from '@/components/Navigation'
import { calculateSaju, analyzeSaju } from '@/utils/sajuLogic'
import type { BirthInfo, SajuData, SajuAnalysis } from '@/utils/sajuLogic'

export default function Home() {
  const [sajuData, setSajuData] = useState<SajuData | null>(null);
  const [sajuAnalysis, setSajuAnalysis] = useState<SajuAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'result' | 'today'>('input');
  const [isCalculating, setIsCalculating] = useState(false);

  const handleSajuCalculation = async (birthInfo: BirthInfo) => {
    setIsCalculating(true);
    
    try {
      // 사주 계산
      const saju = calculateSaju(birthInfo);
      const analysis = analyzeSaju(saju, birthInfo);
      
      setSajuData(saju);
      setSajuAnalysis(analysis);
      setActiveTab('result');
    } catch (error) {
      console.error('사주 계산 중 오류 발생:', error);
      alert('사주 계산 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setSajuData(null);
    setSajuAnalysis(null);
    setActiveTab('input');
  };

  return (
    <>
      <Head>
        <title>사주팔자 - 한국 전통 운세</title>
        <meta name="description" content="정확한 사주팔자 해석과 운세 분석을 제공하는 한국 전통 사주 웹사이트" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800">
        {/* 헤더 */}
        <header className="relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 text-shadow">
                <span className="hanja text-primary-300">四柱八字</span>
                <br />
                <span className="text-3xl md:text-4xl">사주팔자</span>
              </h1>
              <p className="text-xl text-white/80 font-light">
                천년의 지혜로 풀어보는 나의 운명
              </p>
            </motion.div>
          </div>
        </header>

        {/* 전체 네비게이션 */}
        <Navigation />

        {/* 페이지 내 탭 */}
        <nav className="container mx-auto px-4 mb-8">
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setActiveTab('input')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'input'
                  ? 'bg-white text-purple-800 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              사주 입력
            </button>
            <button
              onClick={() => setActiveTab('today')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'today'
                  ? 'bg-white text-purple-800 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              오늘의 운세
            </button>
            {sajuData && (
              <button
                onClick={() => setActiveTab('result')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'result'
                    ? 'bg-white text-purple-800 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                사주 해석
              </button>
            )}
          </div>
        </nav>

        {/* 메인 콘텐츠 */}
        <main className="container mx-auto px-4 pb-16">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {activeTab === 'input' && (
              <div className="max-w-2xl mx-auto">
                <div className="oriental-card p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    생년월일시 입력
                  </h2>
                  <SajuForm 
                    onSubmit={handleSajuCalculation} 
                    isLoading={isCalculating}
                  />
                </div>
              </div>
            )}

            {activeTab === 'today' && (
              <div className="max-w-4xl mx-auto">
                <TodayFortune />
              </div>
            )}

            {activeTab === 'result' && sajuData && sajuAnalysis && (
              <div className="max-w-6xl mx-auto">
                <SajuResult 
                  sajuData={sajuData} 
                  sajuAnalysis={sajuAnalysis}
                  onReset={handleReset}
                />
              </div>
            )}
          </motion.div>
        </main>

        {/* 푸터 */}
        <footer className="bg-black/20 backdrop-blur-sm py-8">
          <div className="container mx-auto px-4 text-center text-white/60">
            <p className="mb-2">© 2024 사주팔자 웹사이트. All rights reserved.</p>
            <p className="text-sm">
              본 사이트의 운세 해석은 참고용이며, 개인의 노력과 선택이 더 중요합니다.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
