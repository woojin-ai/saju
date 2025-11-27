import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { SajuData, SajuAnalysis } from '@/utils/sajuLogic';

interface SajuResultProps {
  sajuData: SajuData;
  sajuAnalysis: SajuAnalysis;
  onReset: () => void;
}

const SajuResult: React.FC<SajuResultProps> = ({ sajuData, sajuAnalysis, onReset }) => {
  const [activeSection, setActiveSection] = useState<'basic' | 'personality' | 'fortune' | 'daewoon' | 'yearly'>('basic');

  const getElementColor = (element: string) => {
    switch (element) {
      case '木': return 'text-green-600';
      case '火': return 'text-red-600';
      case '土': return 'text-yellow-600';
      case '金': return 'text-gray-600';
      case '水': return 'text-blue-600';
      default: return 'text-gray-500';
    }
  };

  const getElementBg = (element: string) => {
    switch (element) {
      case '木': return 'bg-green-100 border-green-300';
      case '火': return 'bg-red-100 border-red-300';
      case '土': return 'bg-yellow-100 border-yellow-300';
      case '金': return 'bg-gray-100 border-gray-300';
      case '水': return 'bg-blue-100 border-blue-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* 리셋 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={onReset}
          className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
        >
          새로 계산하기
        </button>
      </div>

      {/* 사주팔자 표 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="oriental-card p-6"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          사주팔자 (四柱八字)
        </h2>
        
        <div className="saju-grid">
          {/* 헤더 */}
          <div className="pillar-card bg-amber-200 font-bold">
            <div className="text-lg">시주</div>
            <div className="text-sm text-gray-600">時柱</div>
          </div>
          <div className="pillar-card bg-amber-200 font-bold">
            <div className="text-lg">일주</div>
            <div className="text-sm text-gray-600">日柱</div>
          </div>
          <div className="pillar-card bg-amber-200 font-bold">
            <div className="text-lg">월주</div>
            <div className="text-sm text-gray-600">月柱</div>
          </div>
          <div className="pillar-card bg-amber-200 font-bold">
            <div className="text-lg">년주</div>
            <div className="text-sm text-gray-600">年柱</div>
          </div>

          {/* 천간 */}
          <div className={`pillar-card ${getElementBg(sajuData.hour.cheongan)}`}>
            <div className="text-2xl hanja font-bold">{sajuData.hour.cheongan}</div>
            <div className="text-sm">{sajuData.hour.cheonganKor}</div>
          </div>
          <div className={`pillar-card ${getElementBg(sajuData.day.cheongan)} ring-2 ring-red-400`}>
            <div className="text-2xl hanja font-bold">{sajuData.day.cheongan}</div>
            <div className="text-sm">{sajuData.day.cheonganKor}</div>
            <div className="text-xs text-red-600 font-medium">일간</div>
          </div>
          <div className={`pillar-card ${getElementBg(sajuData.month.cheongan)}`}>
            <div className="text-2xl hanja font-bold">{sajuData.month.cheongan}</div>
            <div className="text-sm">{sajuData.month.cheonganKor}</div>
          </div>
          <div className={`pillar-card ${getElementBg(sajuData.year.cheongan)}`}>
            <div className="text-2xl hanja font-bold">{sajuData.year.cheongan}</div>
            <div className="text-sm">{sajuData.year.cheonganKor}</div>
          </div>

          {/* 지지 */}
          <div className={`pillar-card ${getElementBg(sajuData.hour.jiji)}`}>
            <div className="text-2xl hanja font-bold">{sajuData.hour.jiji}</div>
            <div className="text-sm">{sajuData.hour.jijiKor}</div>
          </div>
          <div className={`pillar-card ${getElementBg(sajuData.day.jiji)} ring-2 ring-red-400`}>
            <div className="text-2xl hanja font-bold">{sajuData.day.jiji}</div>
            <div className="text-sm">{sajuData.day.jijiKor}</div>
          </div>
          <div className={`pillar-card ${getElementBg(sajuData.month.jiji)}`}>
            <div className="text-2xl hanja font-bold">{sajuData.month.jiji}</div>
            <div className="text-sm">{sajuData.month.jijiKor}</div>
          </div>
          <div className={`pillar-card ${getElementBg(sajuData.year.jiji)}`}>
            <div className="text-2xl hanja font-bold">{sajuData.year.jiji}</div>
            <div className="text-sm">{sajuData.year.jijiKor}</div>
          </div>
        </div>

        {/* 오행 분석 */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">오행 분석</h3>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(sajuAnalysis.ohaengCount).map(([element, count]) => (
              <div key={element} className={`text-center p-3 rounded-lg border ${getElementBg(element)}`}>
                <div className={`text-2xl font-bold ${getElementColor(element)}`}>{element}</div>
                <div className="text-sm text-gray-600">{count}개</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">{sajuAnalysis.elementAnalysis}</p>
        </div>
      </motion.div>

      {/* 탭 네비게이션 */}
      <div className="flex flex-wrap justify-center gap-2">
        {[
          { key: 'basic', label: '기본 해석' },
          { key: 'personality', label: '성격 분석' },
          { key: 'fortune', label: '운세' },
          { key: 'daewoon', label: '대운' },
          { key: 'yearly', label: '올해 운세' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeSection === tab.key
                ? 'bg-white text-purple-800 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeSection === 'basic' && (
          <div className="oriental-card p-6">
            <h3 className="text-xl font-bold mb-4">일간 해석</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              {sajuAnalysis.ilganAnalysis}
            </p>
            
            <h3 className="text-xl font-bold mb-4">십성 분석</h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {sajuAnalysis.sipseongAnalysis}
            </div>
          </div>
        )}

        {activeSection === 'personality' && (
          <div className="oriental-card p-6">
            <h3 className="text-xl font-bold mb-4">성격 분석</h3>
            <p className="text-gray-700 leading-relaxed">
              {sajuAnalysis.personalityAnalysis}
            </p>
          </div>
        )}

        {activeSection === 'fortune' && (
          <div className="space-y-4">
            <div className="oriental-card p-6">
              <h3 className="text-xl font-bold mb-4">로또 추천 번호</h3>
              <div className="flex space-x-2 mb-4">
                {sajuAnalysis.lottoNumbers.map((number, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  >
                    {number}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                * 로또 번호는 사주를 기반으로 한 참고용이며, 확실한 당첨을 보장하지 않습니다.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'daewoon' && (
          <div className="oriental-card p-6">
            <h3 className="text-xl font-bold mb-4">대운 (大運)</h3>
            <div className="grid gap-4">
              {sajuAnalysis.daewoon.map((daewoon, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">
                      {daewoon.age}세 - {daewoon.age + 9}세
                    </span>
                    <span className="text-lg hanja">
                      {daewoon.cheongan}{daewoon.jiji}
                      <span className="text-sm ml-2">
                        ({daewoon.cheonganKor}{daewoon.jijiKor})
                      </span>
                    </span>
                  </div>
                  <p className="text-gray-700">{daewoon.analysis}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'yearly' && (
          <div className="space-y-6">
            <div className="oriental-card p-6">
              <h3 className="text-xl font-bold mb-4">
                {sajuAnalysis.yearlyFortune.year}년 운세 총평
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {sajuAnalysis.yearlyFortune.summary}
              </p>
            </div>

            <div className="oriental-card p-6">
              <h3 className="text-xl font-bold mb-4">월별 운세</h3>
              <div className="grid gap-4">
                {sajuAnalysis.yearlyFortune.monthly.map((monthly, index) => (
                  <details key={index} className="border border-gray-200 rounded-lg">
                    <summary className="cursor-pointer p-4 bg-gray-50 rounded-lg font-medium">
                      {monthly.month}월 ({monthly.ganjiKor})
                    </summary>
                    <div className="p-4 space-y-3">
                      <div>
                        <strong className="text-pink-600">💕 연애운:</strong>
                        <p className="text-sm text-gray-700 mt-1">{monthly.love}</p>
                      </div>
                      <div>
                        <strong className="text-blue-600">💼 직장운:</strong>
                        <p className="text-sm text-gray-700 mt-1">{monthly.career}</p>
                      </div>
                      <div>
                        <strong className="text-green-600">💰 재물운:</strong>
                        <p className="text-sm text-gray-700 mt-1">{monthly.wealth}</p>
                      </div>
                      <div>
                        <strong className="text-red-600">🏥 건강운:</strong>
                        <p className="text-sm text-gray-700 mt-1">{monthly.health}</p>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SajuResult;
