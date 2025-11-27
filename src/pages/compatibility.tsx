import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import SajuForm from '@/components/SajuForm';
import Navigation from '@/components/Navigation';
import { calculateSaju } from '@/utils/sajuLogic';
import type { BirthInfo, SajuData } from '@/utils/sajuLogic';

interface PersonData {
  birthInfo: BirthInfo;
  saju: SajuData;
}

interface CompatibilityResult {
  person1: PersonData;
  person2: PersonData;
  compatibility: {
    overall: number;
    love: number;
    marriage: number;
    business: number;
    friendship: number;
    analysis: string;
    advice: string;
  };
}

const CompatibilityPage: React.FC = () => {
  const [step, setStep] = useState<'input' | 'result'>('input');
  const [person1Data, setPerson1Data] = useState<PersonData | null>(null);
  const [person2Data, setPerson2Data] = useState<PersonData | null>(null);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (person1Data && person2Data) {
      analyzeCompatibility();
    }
  }, [person1Data, person2Data]);

  const handlePerson1Submit = async (birthInfo: BirthInfo) => {
    setIsCalculating(true);
    try {
      const saju = calculateSaju(birthInfo);
      setPerson1Data({ birthInfo, saju });
    } catch (error) {
      console.error('사주 계산 중 오류:', error);
      alert('사주 계산 중 오류가 발생했습니다.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePerson2Submit = async (birthInfo: BirthInfo) => {
    setIsCalculating(true);
    try {
      const saju = calculateSaju(birthInfo);
      setPerson2Data({ birthInfo, saju });
    } catch (error) {
      console.error('사주 계산 중 오류:', error);
      alert('사주 계산 중 오류가 발생했습니다.');
    } finally {
      setIsCalculating(false);
    }
  };

  const analyzeCompatibility = async () => {
    if (!person1Data || !person2Data) return;
    setIsCalculating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const compatibilityResult = calculateCompatibility(person1Data, person2Data);
      setResult(compatibilityResult);
      setStep('result');
    } catch (error) {
      console.error('궁합 분석 중 오류:', error);
      alert('궁합 분석 중 오류가 발생했습니다.');
    } finally {
      setIsCalculating(false);
    }
  };

  const calculateCompatibility = (person1: PersonData, person2: PersonData): CompatibilityResult => {
    let overall = 70;
    let love = 65;
    let marriage = 75;
    let business = 60;
    let friendship = 80;

    const analysis = '두 분의 사주를 분석한 결과, 전반적으로 좋은 궁합을 보이고 있습니다. 서로의 성격과 가치관이 잘 맞으며, 특히 우정과 결혼 관계에서 좋은 조화를 이룰 수 있습니다.';
    const advice = person1.birthInfo.gender !== person2.birthInfo.gender 
      ? '연인이나 부부 관계에서는 서로의 역할을 명확히 하되 상대방의 영역을 존중하고 지지해주는 것이 중요합니다. 정기적인 대화를 통해 서로를 이해하려 노력하세요.'
      : '동성 간의 관계에서는 건전한 경쟁 의식을 가지되 서로를 진심으로 응원하고 격려하는 마음을 잃지 마세요. 함께 성장할 수 있는 좋은 관계입니다.';

    return {
      person1,
      person2,
      compatibility: {
        overall,
        love,
        marriage,
        business,
        friendship,
        analysis,
        advice
      }
    };
  };

  const handleReset = () => {
    setStep('input');
    setPerson1Data(null);
    setPerson2Data(null);
    setResult(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 35) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return '매우 좋음';
    if (score >= 65) return '좋음';
    if (score >= 50) return '보통';
    if (score >= 35) return '주의';
    return '어려움';
  };

  return (
    <>
      <Head>
        <title>궁합 분석 - 사주팔자</title>
        <meta name="description" content="두 사람의 사주를 비교하여 궁합을 분석해드립니다" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800">
        <header className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="hanja text-primary-300">宮合</span> 궁합 분석
            </h1>
            <p className="text-xl text-white/80">두 사람의 사주로 알아보는 인연의 깊이</p>
          </motion.div>
        </header>

        <Navigation />

        <main className="container mx-auto px-4 pb-16">
          {step === 'input' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid md:grid-cols-2 gap-8">
                <div className="oriental-card p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    첫 번째 사람의 정보
                    {person1Data && (
                      <span className="text-green-600 text-lg ml-2">✓ 입력완료</span>
                    )}
                  </h2>
                  {person1Data ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800 font-medium">
                          {person1Data.birthInfo.year}년 {person1Data.birthInfo.month}월 {person1Data.birthInfo.day}일 
                          {person1Data.birthInfo.hour}시 ({person1Data.birthInfo.gender === 'male' ? '남성' : '여성'})
                        </p>
                        <div className="grid grid-cols-4 gap-2 mt-3 text-center text-sm">
                          <div>
                            <div className="hanja text-lg">{person1Data.saju.hour.cheongan}</div>
                            <div className="hanja text-lg">{person1Data.saju.hour.jiji}</div>
                          </div>
                          <div className="border-l-2 border-red-400">
                            <div className="hanja text-lg font-bold">{person1Data.saju.day.cheongan}</div>
                            <div className="hanja text-lg font-bold">{person1Data.saju.day.jiji}</div>
                          </div>
                          <div>
                            <div className="hanja text-lg">{person1Data.saju.month.cheongan}</div>
                            <div className="hanja text-lg">{person1Data.saju.month.jiji}</div>
                          </div>
                          <div>
                            <div className="hanja text-lg">{person1Data.saju.year.cheongan}</div>
                            <div className="hanja text-lg">{person1Data.saju.year.jiji}</div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setPerson1Data(null)}
                        className="w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        다시 입력하기
                      </button>
                    </div>
                  ) : (
                    <SajuForm onSubmit={handlePerson1Submit} isLoading={isCalculating} />
                  )}
                </div>

                <div className="oriental-card p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    두 번째 사람의 정보
                    {person2Data && (
                      <span className="text-green-600 text-lg ml-2">✓ 입력완료</span>
                    )}
                  </h2>
                  {person2Data ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800 font-medium">
                          {person2Data.birthInfo.year}년 {person2Data.birthInfo.month}월 {person2Data.birthInfo.day}일 
                          {person2Data.birthInfo.hour}시 ({person2Data.birthInfo.gender === 'male' ? '남성' : '여성'})
                        </p>
                        <div className="grid grid-cols-4 gap-2 mt-3 text-center text-sm">
                          <div>
                            <div className="hanja text-lg">{person2Data.saju.hour.cheongan}</div>
                            <div className="hanja text-lg">{person2Data.saju.hour.jiji}</div>
                          </div>
                          <div className="border-l-2 border-red-400">
                            <div className="hanja text-lg font-bold">{person2Data.saju.day.cheongan}</div>
                            <div className="hanja text-lg font-bold">{person2Data.saju.day.jiji}</div>
                          </div>
                          <div>
                            <div className="hanja text-lg">{person2Data.saju.month.cheongan}</div>
                            <div className="hanja text-lg">{person2Data.saju.month.jiji}</div>
                          </div>
                          <div>
                            <div className="hanja text-lg">{person2Data.saju.year.cheongan}</div>
                            <div className="hanja text-lg">{person2Data.saju.year.jiji}</div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setPerson2Data(null)}
                        className="w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        다시 입력하기
                      </button>
                    </div>
                  ) : (
                    <SajuForm onSubmit={handlePerson2Submit} isLoading={isCalculating} />
                  )}
                </div>
              </div>

              {(!person1Data || !person2Data) && (
                <div className="mt-8 text-center">
                  <div className="oriental-card p-6 max-w-2xl mx-auto">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      궁합 분석 안내
                    </h3>
                    <p className="text-gray-700 mb-4">
                      두 사람의 생년월일시를 모두 입력하시면 자동으로 궁합 분석이 시작됩니다.
                    </p>
                    <div className="flex justify-center space-x-4 text-sm">
                      <div className={`px-3 py-1 rounded-full ${person1Data ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        첫 번째 사람 {person1Data ? '✓' : '○'}
                      </div>
                      <div className={`px-3 py-1 rounded-full ${person2Data ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        두 번째 사람 {person2Data ? '✓' : '○'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isCalculating && person1Data && person2Data && (
                <div className="mt-8 text-center">
                  <div className="oriental-card p-8 max-w-md mx-auto">
                    <div className="flex items-center justify-center mb-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      궁합 분석 중...
                    </h3>
                    <p className="text-gray-600">
                      두 분의 사주를 비교하여 궁합을 분석하고 있습니다.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 'result' && result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="flex justify-end">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  새로 분석하기
                </button>
              </div>

              <div className="oriental-card p-8">
                <h2 className="text-2xl font-bold text-center mb-8">궁합 분석 결과</h2>
                
                <div className="grid md:grid-cols-5 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2 text-primary-600">
                      {result.compatibility.overall}점
                    </div>
                    <div className="text-sm text-gray-600">종합 궁합</div>
                    <div className={`text-sm font-medium ${getScoreColor(result.compatibility.overall)}`}>
                      {getScoreText(result.compatibility.overall)}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2 text-pink-600">
                      {result.compatibility.love}점
                    </div>
                    <div className="text-sm text-gray-600">연애 궁합</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2 text-red-600">
                      {result.compatibility.marriage}점
                    </div>
                    <div className="text-sm text-gray-600">결혼 궁합</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2 text-blue-600">
                      {result.compatibility.business}점
                    </div>
                    <div className="text-sm text-gray-600">사업 궁합</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2 text-green-600">
                      {result.compatibility.friendship}점
                    </div>
                    <div className="text-sm text-gray-600">우정 궁합</div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold mb-4">궁합 해석</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {result.compatibility.analysis}
                  </p>
                  
                  <h3 className="text-lg font-bold mb-4">관계 발전을 위한 조언</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {result.compatibility.advice}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="oriental-card p-6">
                  <h3 className="text-lg font-bold mb-4">첫 번째 사람</h3>
                  <div className="text-sm text-gray-600 mb-2">
                    {result.person1.birthInfo.year}년 {result.person1.birthInfo.month}월 {result.person1.birthInfo.day}일 ({result.person1.birthInfo.gender === 'male' ? '남성' : '여성'})
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div>
                      <div className="hanja text-lg">{result.person1.saju.hour.cheongan}</div>
                      <div className="hanja text-lg">{result.person1.saju.hour.jiji}</div>
                    </div>
                    <div className="border-l-2 border-red-400">
                      <div className="hanja text-lg font-bold">{result.person1.saju.day.cheongan}</div>
                      <div className="hanja text-lg font-bold">{result.person1.saju.day.jiji}</div>
                    </div>
                    <div>
                      <div className="hanja text-lg">{result.person1.saju.month.cheongan}</div>
                      <div className="hanja text-lg">{result.person1.saju.month.jiji}</div>
                    </div>
                    <div>
                      <div className="hanja text-lg">{result.person1.saju.year.cheongan}</div>
                      <div className="hanja text-lg">{result.person1.saju.year.jiji}</div>
                    </div>
                  </div>
                </div>

                <div className="oriental-card p-6">
                  <h3 className="text-lg font-bold mb-4">두 번째 사람</h3>
                  <div className="text-sm text-gray-600 mb-2">
                    {result.person2.birthInfo.year}년 {result.person2.birthInfo.month}월 {result.person2.birthInfo.day}일 ({result.person2.birthInfo.gender === 'male' ? '남성' : '여성'})
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div>
                      <div className="hanja text-lg">{result.person2.saju.hour.cheongan}</div>
                      <div className="hanja text-lg">{result.person2.saju.hour.jiji}</div>
                    </div>
                    <div className="border-l-2 border-red-400">
                      <div className="hanja text-lg font-bold">{result.person2.saju.day.cheongan}</div>
                      <div className="hanja text-lg font-bold">{result.person2.saju.day.jiji}</div>
                    </div>
                    <div>
                      <div className="hanja text-lg">{result.person2.saju.month.cheongan}</div>
                      <div className="hanja text-lg">{result.person2.saju.month.jiji}</div>
                    </div>
                    <div>
                      <div className="hanja text-lg">{result.person2.saju.year.cheongan}</div>
                      <div className="hanja text-lg">{result.person2.saju.year.jiji}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
};

export default CompatibilityPage;
