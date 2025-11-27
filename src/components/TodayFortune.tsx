import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getTodayGanji, analyzeTodayFortune, SajuData } from '@/utils/sajuLogic';

const TodayFortune: React.FC = () => {
  const [todayGanji, setTodayGanji] = useState<any>(null);
  const [sampleFortune, setSampleFortune] = useState<any>(null);

  useEffect(() => {
    // 오늘의 간지 정보 가져오기
    const today = getTodayGanji();
    setTodayGanji(today);

    // 샘플 사주로 오늘의 운세 계산 (갑자년 을축월 병인일 정묘시 남성)
    const sampleSaju: SajuData = {
      year: { cheongan: '甲', jiji: '子', cheonganKor: '갑', jijiKor: '자' },
      month: { cheongan: '乙', jiji: '丑', cheonganKor: '을', jijiKor: '축' },
      day: { cheongan: '丙', jiji: '寅', cheonganKor: '병', jijiKor: '인' },
      hour: { cheongan: '丁', jiji: '卯', cheonganKor: '정', jijiKor: '묘' }
    };

    const fortune = analyzeTodayFortune(sampleSaju);
    setSampleFortune(fortune);
  }, []);

  if (!todayGanji || !sampleFortune) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 오늘의 날짜와 간지 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="oriental-card p-6 text-center"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          오늘의 운세
        </h2>
        <div className="text-lg text-gray-600 mb-2">
          {todayGanji.date}
        </div>
        <div className="text-3xl hanja font-bold text-primary-600 mb-2">
          {todayGanji.day.cheongan}{todayGanji.day.jiji}
        </div>
        <div className="text-lg text-gray-500">
          {todayGanji.day.cheonganKor}{todayGanji.day.jijiKor}일
        </div>
      </motion.div>

      {/* 오늘의 총운 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="oriental-card p-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          ⭐ 오늘의 총운
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {sampleFortune.overall}
        </p>
      </motion.div>

      {/* 행운의 정보들 */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="oriental-card p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            🎨 행운의 색상
          </h3>
          <div className="flex flex-wrap gap-2">
            {sampleFortune.luckyColor.map((color: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
              >
                {color}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="oriental-card p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            🧭 행운의 방향
          </h3>
          <div className="text-2xl font-bold text-primary-600">
            {sampleFortune.luckyDirection}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            중요한 일을 할 때 이 방향을 향해보세요
          </p>
        </motion.div>
      </div>

      {/* 행운의 시간 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="oriental-card p-6"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          ⏰ 행운의 시간
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sampleFortune.luckyTime.map((time: string, index: number) => (
            <div
              key={index}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-3 rounded-lg text-center font-medium"
            >
              {time}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-3">
          이 시간대에 중요한 결정이나 새로운 시작을 하면 좋습니다
        </p>
      </motion.div>

      {/* 주의사항 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="oriental-card p-6 border-l-4 border-orange-400"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          ⚠️ 오늘 주의할 점
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {sampleFortune.caution}
        </p>
      </motion.div>

      {/* 일반적인 조언 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="oriental-card p-6 bg-gradient-to-r from-blue-50 to-purple-50"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          💡 오늘의 지혜
        </h3>
        <div className="space-y-3 text-gray-700">
          <p>• <strong>긍정적인 마음가짐</strong>을 유지하면 좋은 기운이 따릅니다</p>
          <p>• <strong>감사하는 마음</strong>으로 하루를 시작하세요</p>
          <p>• <strong>소소한 행복</strong>을 놓치지 마세요</p>
          <p>• <strong>타인을 배려</strong>하는 마음이 좋은 인연을 만듭니다</p>
        </div>
      </motion.div>

      {/* 면책 조항 */}
      <div className="text-center text-sm text-white/60">
        <p>
          * 오늘의 운세는 일반적인 해석이며, 개인의 사주에 따라 다를 수 있습니다.
          <br />
          정확한 개인 운세는 생년월일시를 입력하여 확인하세요.
        </p>
      </div>
    </div>
  );
};

export default TodayFortune;
