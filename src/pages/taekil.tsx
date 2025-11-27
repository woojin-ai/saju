import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import SajuForm from '@/components/SajuForm';
import Navigation from '@/components/Navigation';
import { calculateSaju } from '@/utils/sajuLogic';
import { useGoodDaysWorker, type GoodDay } from '@/hooks/useGoodDays';
import { useOptimizedGoodDays } from '@/hooks/useOptimizedGoodDays';
import type { BirthInfo, SajuData } from '@/utils/sajuLogic';

const TaekIlPage: React.FC = () => {
  console.log('🔥 TaekIlPage 컴포넌트 로드됨 - 새 코드 반영 확인');
  
  const [step, setStep] = useState<'input' | 'date-select' | 'result'>('input');
  const [sajuData, setSajuData] = useState<SajuData | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
    purpose: 'wedding'
  });
  const [dateErrors, setDateErrors] = useState<{[key: string]: string}>({});
  
  // 방식 선택: 'original' | 'optimized'
  const [workerMode, setWorkerMode] = useState<'original' | 'optimized'>('optimized');
  
  // 두 방식의 워커 훅
  const originalWorker = useGoodDaysWorker();
  const optimizedWorker = useOptimizedGoodDays();
  
  // 현재 선택된 워커 사용
  const currentWorker = workerMode === 'original' ? originalWorker : optimizedWorker;
  
  // 계산 취소 함수
  const handleCalculationCancel = () => {
    console.log('🛑 사용자가 계산 취소 요청');
    currentWorker.abort();
  };
  
  // 현재 워커의 상태값들 추출
  const { progress: calculationProgress, items: goodDays, running: isCalculating, status: calculationStatus, start, abort } = currentWorker;
  const hotspots = 'hotspots' in currentWorker ? currentWorker.hotspots : [];
  
  // 워커 상태 모니터링
  useEffect(() => {
    console.log('🔍 워커 상태 변화:', {
      workerMode,
      isCalculating,
      progress: calculationProgress,
      status: calculationStatus,
      itemsCount: goodDays.length
    });
  }, [workerMode, isCalculating, calculationProgress, calculationStatus, goodDays.length]);
  
  // 계산 완료 시 자동으로 result 단계로 이동
  useEffect(() => {
    if (step === 'date-select' && !isCalculating && goodDays.length > 0) {
      console.log('✅ 계산 완료 감지, 결과 단계로 이동');
      setStep('result');
    }
  }, [step, isCalculating, goodDays.length]);

  const purposeOptions = [
    { value: 'wedding', label: '결혼식', description: '혼례를 올리기 좋은 날' },
    { value: 'moving', label: '이사', description: '이사하기 좋은 날' },
    { value: 'business', label: '개업', description: '사업을 시작하기 좋은 날' },
    { value: 'contract', label: '계약', description: '중요한 계약을 하기 좋은 날' },
    { value: 'general', label: '일반', description: '일반적으로 좋은 날' }
  ];

  const handleSajuSubmit = async (birthInfo: BirthInfo) => {
    try {
      const saju = calculateSaju(birthInfo);
      setSajuData(saju);
      setStep('date-select');
    } catch (error) {
      console.error('사주 계산 중 오류:', error);
      alert('사주 계산 중 오류가 발생했습니다.');
    }
  };

  const validateDateRange = (startDate: string, endDate: string) => {
    const errors: {[key: string]: string} = {};
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        errors.endDate = '종료 날짜는 시작 날짜보다 늦어야 합니다';
      } else {
        const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 365) {
          errors.endDate = '날짜 범위는 1년 이내로 설정해주세요';
        }
        if (daysDiff > 90) {
          errors.general = '💡 90일 이상의 범위는 계산 시간이 오래 걸릴 수 있습니다';
        }
      }
    }
    
    setDateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
    
    // 실시간 유효성 검사
    setTimeout(() => {
      validateDateRange(newDateRange.startDate, newDateRange.endDate);
    }, 300);
  };

  // ✨ 새로운 간단한 handleDateSubmit - Web Worker로 모든 복잡성 제거!
  const handleDateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 handleDateSubmit 시작');
    
    if (!sajuData || !dateRange.startDate || !dateRange.endDate) {
      console.log('❌ 필수 정보 누락:', { sajuData: !!sajuData, startDate: dateRange.startDate, endDate: dateRange.endDate });
      alert('필수 정보가 누락되었습니다.');
      return;
    }
    
    if (!validateDateRange(dateRange.startDate, dateRange.endDate)) {
      console.log('❌ 날짜 범위 유효성 검사 실패');
      return;
    }
    
    console.log('✅ 유효성 검사 통과, 워커 시작:', {
      workerMode,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      purpose: dateRange.purpose
    });
    
    // 날짜 차이 계산
    const daysDiff = Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24));
    console.log(`📊 계산할 날짜 수: ${daysDiff}일`);
    
    // 대용량 데이터 경고
    if (daysDiff > 100) {
      const userConfirm = confirm(
        `⚠️ 대용량 데이터 처리 경고\n\n` +
        `총 ${daysDiff}일의 데이터를 분석합니다.\n` +
        `Web Worker로 처리하여 브라우저가 멈추지 않습니다.\n\n` +
        `계속하시겠습니까?`
      );
      
      if (!userConfirm) {
        console.log('🛑 사용자가 대용량 처리를 취소함');
        return;
      }
    }
    
    try {
      console.log('🎯 현재 워커 상태:', {
        running: currentWorker.running,
        workerType: workerMode
      });
      
      console.log('📤 워커에 작업 전송 중...');
      currentWorker.start({
        saju: sajuData,
        startDate: new Date(dateRange.startDate),
        endDate: new Date(dateRange.endDate),
        purpose: dateRange.purpose
      });
      
      console.log('✅ 워커 시작 완료 - 상태 변화를 기다리는 중...');
      // 결과 페이지로의 이동은 useEffect에서 자동 처리
      
    } catch (error) {
      console.error('❌ 워커 시작 중 오류:', error);
      alert(`계산 시작 중 오류가 발생했습니다: ${error}`);
    }
  };

  // 브라우저 메인 스레드 완전 해제 - requestAnimationFrame 사용
  const findGoodDaysWithProgress = async (saju: SajuData, startDate: Date, endDate: Date, purpose: string): Promise<GoodDay[]> => {
    return new Promise((resolve, reject) => {
      try {
        console.log('🚀 브라우저 메인 스레드 해제 방식 시작:', { startDate, endDate, purpose });
        
        const days: GoodDay[] = [];
        const current = new Date(startDate);
        const totalDays = Math.min(400, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        let dayCount = 0;
        
        console.log(`📊 총 처리할 날짜 수: ${totalDays}`);
        setCalculationStatus(`전체 ${totalDays}일 분석 시작...`);
        
        const processOneDay = () => {
          try {
            // 취소 상태 우선 확인
            if (calculationCancelled) {
              console.log('🛑 계산이 취소되었습니다');
              reject(new Error('사용자가 계산을 취소했습니다'));
              return;
            }
            
            // 완료 체크
            if (current > endDate || dayCount >= 400) {
              console.log(`✅ 총 ${days.length}일 수집 완료, 정렬 시작`);
              setCalculationStatus('정렬 중...');
              setCalculationProgress(95);
              
              // 정렬도 비동기로
              requestAnimationFrame(() => {
                try {
                  console.log('🔄 데이터 정렬 중...');
                  days.sort((a, b) => b.score - a.score);
                  
                  console.log('🎯 정렬 완료, 상위 3개:', days.slice(0, 3).map(d => ({ 
                    date: d.date.toDateString(), 
                    score: d.score, 
                    quality: d.quality 
                  })));
                  
                  setCalculationProgress(100);
                  setCalculationStatus(`완료! 총 ${days.length}일 분석`);
                  
                  console.log('🎉 모든 처리 완료!');
                  resolve(days);
                } catch (sortError) {
                  console.error('❌ 정렬 오류:', sortError);
                  reject(sortError);
                }
              });
              return;
            }
            
            // 하나의 날짜만 처리
            try {
              const dayAnalysis = analyzeDayQuality(saju, new Date(current), purpose);
              days.push(dayAnalysis);
              dayCount++;
              current.setDate(current.getDate() + 1);
            } catch (error) {
              console.error('⚠️ 날짜 분석 오류:', current, error);
              current.setDate(current.getDate() + 1);
              dayCount++;
            }
            
            // 진행률 업데이트
            const progress = Math.min(100, Math.round((dayCount / totalDays) * 100));
            setCalculationProgress(progress);
            setCalculationStatus(`${dayCount}/${totalDays}일 분석 중... (${progress}%)`);
            
            if (dayCount % 10 === 0) {
              console.log(`📈 진행률: ${progress}%, 처리된 날짜: ${dayCount}/${totalDays}`);
            }
            
            // 다음 날짜 처리를 requestAnimationFrame으로 스케줄링
            requestAnimationFrame(processOneDay);
            
          } catch (dayError) {
            console.error('❌ processOneDay 오류:', dayError);
            reject(dayError);
          }
        };
        
        // 처리 시작
        console.log('⏳ requestAnimationFrame으로 처리 시작...');
        requestAnimationFrame(processOneDay);
        
      } catch (error) {
        console.error('❌ findGoodDaysWithProgress 전체 오류:', error);
        reject(error);
      }
    });
  };

  const findGoodDays = (saju: SajuData, startDate: Date, endDate: Date, purpose: string): GoodDay[] => {
    console.log('findGoodDays 시작:', { startDate, endDate, purpose });
    
    const days: GoodDay[] = [];
    const current = new Date(startDate);
    let dayCount = 0;
    const maxDays = 400; // 최대 제한
    
    while (current <= endDate && dayCount < maxDays) {
      try {
        const dayAnalysis = analyzeDayQuality(saju, new Date(current), purpose);
        days.push(dayAnalysis);
        dayCount++;
        
        if (dayCount % 50 === 0) {
          console.log(`${dayCount}일 처리 완료`);
        }
      } catch (error) {
        console.error('날짜 분석 오류:', current, error);
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    console.log(`총 ${days.length}일 수집 완료`);
    
    // 점수 순으로 정렬
    days.sort((a, b) => b.score - a.score);
    
    console.log('정렬 완료, 상위 5개:', days.slice(0, 5).map(d => ({ 
      date: d.date.toDateString(), 
      score: d.score, 
      quality: d.quality 
    })));
    
    return days;
  };

  const analyzeDayQuality = (saju: SajuData, targetDate: Date, purpose: string): GoodDay => {
    try {
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;
      const day = targetDate.getDate();
      
      // 간단한 일주 계산 (최적화된 버전)
      const dayGanji = getDayGanjiOptimized(year, month, day);
      
      let score = 50; // 기본 점수
      const reasons: string[] = [];
      
      // 요일별 점수 (간단화)
      const dayOfWeek = targetDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // 주말
        if (purpose === 'wedding') {
          score += 15;
          reasons.push('주말로 결혼식에 적합');
        }
      } else { // 평일
        if (purpose === 'business' || purpose === 'contract') {
          score += 10;
          reasons.push('평일로 사업/계약에 적합');
        }
      }
      
      // 간단한 날짜별 길흉
      if (day % 7 === 1 || day % 7 === 3 || day % 7 === 6) {
        score += 10;
        reasons.push('길한 날짜');
      }
      
      // 월별 보정 (간단화)
      if (month === 5 || month === 6 || month === 9 || month === 10) {
        score += 5;
        reasons.push('좋은 계절');
      }
      
      // 목적별 보정 (간단화)
      if (purpose === 'wedding' && month >= 4 && month <= 6) {
        score += 10;
        reasons.push('혼례에 좋은 계절');
      } else if (purpose === 'moving' && (month >= 3 && month <= 5 || month >= 9 && month <= 11)) {
        score += 8;
        reasons.push('이사에 좋은 계절');
      }
      
      // 점수 범위 조정
      score = Math.max(0, Math.min(100, score));
      
      // 등급 결정 (간단화)
      let quality = '';
      if (score >= 80) quality = '대길';
      else if (score >= 65) quality = '길';
      else if (score >= 50) quality = '평';
      else if (score >= 35) quality = '소흉';
      else quality = '흉';
      
      return {
        date: new Date(targetDate),
        ganji: `${dayGanji.cheongan}${dayGanji.jiji}`,
        ganjiKor: `${dayGanji.cheonganKor}${dayGanji.jijiKor}`,
        score: score,
        quality: quality,
        reasons: reasons.length > 3 ? reasons.slice(0, 3) : reasons // 이유 제한
      };
    } catch (error) {
      console.error('analyzeDayQuality 오류:', error);
      // 오류 시 기본값 반환
      return {
        date: new Date(targetDate),
        ganji: '갑자',
        ganjiKor: '갑자',
        score: 50,
        quality: '평',
        reasons: ['분석 오류']
      };
    }
  };

  // 최적화된 간지 계산 함수
  const getDayGanjiOptimized = (year: number, month: number, day: number) => {
    try {
      // 미리 계산된 상수 배열
      const CHEONGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const CHEONGAN_KOR = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
      const JIJI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      const JIJI_KOR = ['자', '축', '인', '문', '진', '사', '오', '미', '신', '유', '술', '해'];
      
      // 최적화된 계산
      const baseYear = 2000;
      const baseMonth = 1;
      const baseDay = 1;
      
      const yearDiff = year - baseYear;
      const monthDiff = month - baseMonth;
      const dayDiff = day - baseDay;
      
      // 간단한 방식으로 계산
      const totalDays = yearDiff * 365 + Math.floor(yearDiff / 4) + monthDiff * 30 + dayDiff;
      
      const cheonganIdx = (totalDays % 10 + 10) % 10;
      const jijiIdx = (totalDays % 12 + 12) % 12;
      
      return {
        cheongan: CHEONGAN[cheonganIdx],
        jiji: JIJI[jijiIdx],
        cheonganKor: CHEONGAN_KOR[cheonganIdx],
        jijiKor: JIJI_KOR[jijiIdx]
      };
    } catch (error) {
      console.error('getDayGanjiOptimized 오류:', error);
      return {
        cheongan: '甲',
        jiji: '子',
        cheonganKor: '갑',
        jijiKor: '자'
      };
    }
  };

  const getDayGanji = (year: number, month: number, day: number) => {
    // 간단한 일주 계산
    const CHEONGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const CHEONGAN_KOR = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
    const JIJI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const JIJI_KOR = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
    
    const baseDate = new Date(2000, 0, 1);
    const targetDate = new Date(year, month - 1, day);
    const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const cheonganIdx = ((diffDays % 10) + 10) % 10;
    const jijiIdx = ((diffDays % 12) + 12) % 12;
    
    return {
      cheongan: CHEONGAN[cheonganIdx],
      jiji: JIJI[jijiIdx],
      cheonganKor: CHEONGAN_KOR[cheonganIdx],
      jijiKor: JIJI_KOR[jijiIdx]
    };
  };

  const handleReset = () => {
    console.log('🔄 리셋 요청');
    setStep('input');
    setSajuData(null);
    // 현재 워커 중단
    if (isCalculating) {
      currentWorker.abort();
    }
    setDateRange({
      startDate: '',
      endDate: '',
      purpose: 'wedding'
    });
    setDateErrors({});
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case '대길': return 'bg-green-100 text-green-800 border-green-300';
      case '길': return 'bg-blue-100 text-blue-800 border-blue-300';
      case '평': return 'bg-gray-100 text-gray-800 border-gray-300';
      case '소흉': return 'bg-orange-100 text-orange-800 border-orange-300';
      case '흉': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const getWeekday = (date: Date) => {
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    return weekdays[date.getDay()];
  };

  return (
    <>
      <Head>
        <title>택일 - 좋은 날 찾기 - 사주팔자</title>
        <meta name="description" content="사주를 기반으로 좋은 날을 찾아드립니다" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800">
        <header className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="hanja text-primary-300">🔥🔥 擇日</span> 택일 (코드 반영 테스트)
            </h1>
            <p className="text-xl text-white/80">사주로 찾는 나에게 좋은 날</p>
          </motion.div>
        </header>

        <Navigation />

        <main className="container mx-auto px-4 pb-16">
          {step === 'input' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="oriental-card p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  생년월일시 입력
                </h2>
                <SajuForm onSubmit={handleSajuSubmit} isLoading={isCalculating} />
              </div>
            </motion.div>
          )}

          {step === 'date-select' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="oriental-card p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    날짜 범위 및 목적 선택
                  </h2>
                  <button
                    onClick={() => setStep('input')}
                    className="text-primary-600 hover:text-primary-800 text-sm"
                  >
                    ← 사주 정보 수정
                  </button>
                </div>

                <form onSubmit={handleDateSubmit} className="space-y-6">
                  {/* 워커 방식 선택 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      🛠️ 계산 방식 선택
                    </label>
                    <div className="grid gap-3">
                      <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        workerMode === 'optimized'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          value="optimized"
                          checked={workerMode === 'optimized'}
                          onChange={(e) => setWorkerMode(e.target.value as 'original' | 'optimized')}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-medium text-blue-800">🚀 최적화된 방식 (Blob Worker)</div>
                          <div className="text-sm text-blue-600">빠르고 안정적, Next.js 호환성 개선</div>
                        </div>
                      </label>
                      
                      <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        workerMode === 'original'
                          ? 'border-gray-500 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          value="original"
                          checked={workerMode === 'original'}
                          onChange={(e) => setWorkerMode(e.target.value as 'original' | 'optimized')}
                          className="mr-3 text-gray-600 focus:ring-gray-500"
                        />
                        <div>
                          <div className="font-medium text-gray-800">🔧 기존 방식 (Module Worker)</div>
                          <div className="text-sm text-gray-600">기존 워커 방식, 비교용</div>
                        </div>
                      </label>
                    </div>
                    
                    {/* 성능 핫스팟 정보 */}
                    {hotspots.length > 0 && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-sm font-medium text-yellow-800 mb-1">
                          ⚡ 성능 핫스팟 감지: {hotspots.length}건
                        </div>
                        <div className="text-xs text-yellow-700">
                          최대 소요 시간: {Math.max(...hotspots.map(h => h.duration)).toFixed(1)}ms
                        </div>
                      </div>
                    )}
                  </div>
                  {/* 목적 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      목적 선택
                    </label>
                    <div className="grid gap-3">
                      {purposeOptions.map(option => (
                        <label
                          key={option.value}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                            dateRange.purpose === option.value
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={dateRange.purpose === option.value}
                            onChange={(e) => setDateRange(prev => ({ ...prev, purpose: e.target.value }))}
                            className="mr-3 text-primary-600 focus:ring-primary-500"
                          />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 날짜 유효성 검사 메시지 */}
                  {(dateErrors.endDate || dateErrors.general) && (
                    <div className="space-y-2">
                      {dateErrors.endDate && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-start">
                            <div className="text-red-400 mr-2">⚠️</div>
                            <div className="text-sm text-red-700">{dateErrors.endDate}</div>
                          </div>
                        </div>
                      )}
                      {dateErrors.general && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-start">
                            <div className="text-yellow-500 mr-2">💡</div>
                            <div className="text-sm text-yellow-700">{dateErrors.general}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 날짜 범위 정보 */}
                  {dateRange.startDate && dateRange.endDate && !dateErrors.endDate && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-sm text-blue-800">
                        <div className="font-medium mb-1">📅 선택된 기간</div>
                        <div className="flex items-center justify-between">
                          <span>{new Date(dateRange.startDate).toLocaleDateString('ko-KR')} ~ {new Date(dateRange.endDate).toLocaleDateString('ko-KR')}</span>
                          <span className="font-medium">
                            {Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24))}일
                          </span>
                        </div>
                        {/* 경고 메시지 */}
                        {Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24)) > 180 && (
                          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-xs">
                            ⚠️ 대용량 데이터 처리: {Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24))}일 분석에 시간이 더 오래 걸릴 수 있습니다.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 날짜 범위 */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        시작 날짜
                      </label>
                      <div className="relative group">
                        <input
                          type="date"
                          value={dateRange.startDate}
                          onChange={(e) => handleDateChange('startDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          max={new Date(new Date().getFullYear() + 5, 11, 31).toISOString().split('T')[0]}
                          className="input-oriental cursor-pointer w-full pr-10 text-center md:text-left transition-all duration-200 hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 touch-manipulation min-h-[48px] text-base md:text-sm"
                          required
                          onFocus={(e) => {
                            // 포커스 시 자동으로 선택기 열기 (브라우저 지원 시에만)
                            setTimeout(() => {
                              try {
                                if (e.target instanceof HTMLInputElement && typeof e.target.showPicker === 'function') {
                                  e.target.showPicker();
                                }
                              } catch (error) {
                                // showPicker 지원하지 않는 브라우저에서는 무시
                              }
                            }, 100);
                          }}
                          onClick={(e) => {
                            try {
                              if (e.target instanceof HTMLInputElement && typeof e.target.showPicker === 'function') {
                                e.target.showPicker();
                              }
                            } catch (error) {
                              // showPicker 지원하지 않는 브라우저에서는 무시
                            }
                          }}
                        />
                        {/* 달력 아이콘 */}
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        {/* 클릭 영역 확장 */}
                        <div 
                          className="absolute inset-0 cursor-pointer bg-transparent rounded-lg" 
                          onClick={(e) => {
                            e.preventDefault();
                            const input = e.currentTarget.previousElementSibling?.previousElementSibling as HTMLInputElement;
                            if (input) {
                              input.focus();
                              // 더 안전한 showPicker 호출
                              setTimeout(() => {
                                try {
                                  if (input && 
                                      typeof input.showPicker === 'function' && 
                                      input.showPicker !== undefined) {
                                    input.showPicker();
                                  }
                                } catch (error) {
                                  // showPicker 지원하지 않는 브라우저에서는 무시
                                  console.debug('showPicker not supported:', error);
                                }
                              }, 50);
                            }
                          }}
                          aria-hidden="true"
                        />
                      </div>
                      {dateRange.startDate && (
                        <div className="mt-1 text-xs text-gray-500">
                          📅 {new Date(dateRange.startDate).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short'
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        종료 날짜
                      </label>
                      <div className="relative group">
                        <input
                          type="date"
                          value={dateRange.endDate}
                          onChange={(e) => handleDateChange('endDate', e.target.value)}
                          min={dateRange.startDate || new Date().toISOString().split('T')[0]}
                          max={new Date(new Date().getFullYear() + 5, 11, 31).toISOString().split('T')[0]}
                          className="input-oriental cursor-pointer w-full pr-10 text-center md:text-left transition-all duration-200 hover:border-primary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 touch-manipulation min-h-[48px] text-base md:text-sm"
                          required
                          onFocus={(e) => {
                            setTimeout(() => {
                              try {
                                if (e.target instanceof HTMLInputElement && typeof e.target.showPicker === 'function') {
                                  e.target.showPicker();
                                }
                              } catch (error) {
                                // showPicker 지원하지 않는 브라우저에서는 무시
                              }
                            }, 100);
                          }}
                          onClick={(e) => {
                            try {
                              if (e.target instanceof HTMLInputElement && typeof e.target.showPicker === 'function') {
                                e.target.showPicker();
                              }
                            } catch (error) {
                              // showPicker 지원하지 않는 브라우저에서는 무시
                            }
                          }}
                        />
                        {/* 달력 아이콘 */}
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        {/* 클릭 영역 확장 */}
                        <div 
                          className="absolute inset-0 cursor-pointer bg-transparent rounded-lg" 
                          onClick={(e) => {
                            e.preventDefault();
                            const input = e.currentTarget.previousElementSibling?.previousElementSibling as HTMLInputElement;
                            if (input) {
                              input.focus();
                              // 더 안전한 showPicker 호출
                              setTimeout(() => {
                                try {
                                  if (input && 
                                      typeof input.showPicker === 'function' && 
                                      input.showPicker !== undefined) {
                                    input.showPicker();
                                  }
                                } catch (error) {
                                  // showPicker 지원하지 않는 브라우저에서는 무시
                                  console.debug('showPicker not supported:', error);
                                }
                              }, 50);
                            }
                          }}
                          aria-hidden="true"
                        />
                      </div>
                      {dateRange.endDate && (
                        <div className="mt-1 text-xs text-gray-500">
                          📅 {new Date(dateRange.endDate).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short'
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 빠른 날짜 선택 버튼들 */}
                  {!dateRange.startDate && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-700">빠른 선택</div>
                        <div className="text-xs text-gray-500">탭해서 자동 입력</div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: '이번 달', days: 30, emoji: '📅', desc: '오늘부터 30일' },
                          { label: '3개월', days: 90, emoji: '📆', desc: '오늘부터 90일' },
                          { label: '6개월', days: 180, emoji: '🗓️', desc: '오늘부터 180일' },
                          { label: '1년', days: 365, emoji: '📈', desc: '오늘부터 365일' }
                        ].map((option) => {
                          const startDate = new Date();
                          const endDate = new Date();
                          endDate.setDate(startDate.getDate() + option.days);
                          
                          return (
                            <motion.button
                              key={option.label}
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setDateRange(prev => ({
                                  ...prev,
                                  startDate: startDate.toISOString().split('T')[0],
                                  endDate: endDate.toISOString().split('T')[0]
                                }));
                                // 유효성 검사도 실행
                                setTimeout(() => {
                                  validateDateRange(
                                    startDate.toISOString().split('T')[0],
                                    endDate.toISOString().split('T')[0]
                                  );
                                }, 100);
                              }}
                              className="group relative px-4 py-3 border border-gray-300 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 text-left"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{option.emoji}</span>
                                <div>
                                  <div className="font-medium text-gray-800 group-hover:text-primary-700">
                                    {option.label}
                                  </div>
                                  <div className="text-xs text-gray-500 group-hover:text-primary-600">
                                    {option.desc}
                                  </div>
                                </div>
                              </div>
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                      <div className="text-xs text-gray-400 text-center">
                        위 버튼을 클릭하면 자동으로 날짜가 설정됩니다
                      </div>
                    </div>
                  )}

                  {/* 날짜 초기화 버튼 */}
                  {(dateRange.startDate || dateRange.endDate) && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setDateRange(prev => ({
                            ...prev,
                            startDate: '',
                            endDate: ''
                          }));
                          setDateErrors({});
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                      >
                        날짜 초기화
                      </button>
                    </div>
                  )}

                  {/* 버튼 영역 */}
                  <div className="space-y-3">
                    <motion.button
                      type="submit"
                      disabled={isCalculating || !dateRange.startDate || !dateRange.endDate || Object.keys(dateErrors).some(key => key !== 'general')}
                      whileHover={{ scale: isCalculating ? 1 : 1.02 }}
                      whileTap={{ scale: isCalculating ? 1 : 0.98 }}
                      onClick={() => console.log('💆 버튼 클릭됨 - handleDateSubmit 호출 예정')}
                      className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 relative overflow-hidden ${
                        isCalculating || !dateRange.startDate || !dateRange.endDate || Object.keys(dateErrors).some(key => key !== 'general')
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'btn-oriental'
                      }`}
                    >
                      {/* 진행률 배경 바 */}
                      {isCalculating && (
                        <div 
                          className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 transition-all duration-300"
                          style={{ width: `${calculationProgress}%` }}
                        />
                      )}
                      
                      <div className="relative z-10">
                        {isCalculating ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                              <span className="text-white font-medium">
                                {calculationStatus || '좋은 날 찾는 중...'}
                              </span>
                            </div>
                            
                            {/* 진행률 표시 */}
                            <div className="w-full bg-white/20 rounded-full h-2 mx-auto max-w-xs">
                              <div 
                                className="bg-white h-2 rounded-full transition-all duration-300"
                                style={{ width: `${calculationProgress}%` }}
                              />
                            </div>
                            
                            <div className="text-sm text-white/90">
                              {calculationProgress}% 완료
                              {dateRange.startDate && dateRange.endDate && (
                                <span className="ml-2">
                                  (최대 {Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24))}일 분석)
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <span>🔍 좋은 날 찾기</span>
                            {dateRange.startDate && dateRange.endDate && (
                              <span className="ml-2 text-sm opacity-75">
                                ({Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24))}일 분석)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.button>
                    
                    {/* 취소 버튼 - 계산 중일 때만 표시 */}
                    {isCalculating && (
                      <motion.button
                        type="button"
                        onClick={handleCalculationCancel}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-200"
                      >
                        ❌ 계산 중단
                      </motion.button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {step === 'result' && goodDays.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {purposeOptions.find(p => p.value === dateRange.purpose)?.label} 좋은 날
                  </h2>
                  <div className="text-sm text-white/80 mt-1">
                    {workerMode === 'optimized' ? '🚀 최적화된 방식' : '🔧 기존 방식'}으로 계산됨
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  새로 찾기
                </button>
              </div>

              {/* 성능 통계 및 요약 */}
              <div className="oriental-card p-6">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {goodDays.filter(d => d.quality === '대길').length}일
                    </div>
                    <div className="text-sm text-gray-600">대길</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {goodDays.filter(d => d.quality === '길').length}일
                    </div>
                    <div className="text-sm text-gray-600">길</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">
                      {goodDays.filter(d => d.quality === '평').length}일
                    </div>
                    <div className="text-sm text-gray-600">평</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {goodDays.filter(d => d.quality === '소흉').length}일
                    </div>
                    <div className="text-sm text-gray-600">소흉</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {goodDays.filter(d => d.quality === '흉').length}일
                    </div>
                    <div className="text-sm text-gray-600">흉</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {goodDays.length}일
                    </div>
                    <div className="text-sm text-gray-600">총 건수</div>
                  </div>
                </div>
                
                {/* 성능 정보 (최적화된 방식일 때만) */}
                {workerMode === 'optimized' && hotspots.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      ⚡ 성능 모니터링: 핫스팟 {hotspots.length}건 감지
                      {hotspots.length > 0 && (
                        <span className="ml-2">
                          (최대 {Math.max(...hotspots.map(h => h.duration)).toFixed(1)}ms)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 가장 좋은 날들 */}
              <div className="oriental-card p-6">
                <h3 className="text-xl font-bold mb-6">추천 길일 (상위 10개)</h3>
                <div className="grid gap-4">
                  {goodDays.slice(0, 10).map((day, index) => (
                    <motion.div
                      key={day.date.toISOString()}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-2 ${
                        index < 3 ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-lg font-bold">
                              {formatDate(day.date)}
                            </div>
                            <div className="text-sm text-gray-600">
                              ({getWeekday(day.date)})
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="hanja text-lg font-bold">
                              {day.ganji}
                            </div>
                            <div className="text-sm text-gray-600">
                              {day.ganjiKor}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getQualityColor(day.quality)}`}>
                            {day.quality}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {day.score}점
                          </div>
                          {index < 3 && (
                            <div className="text-xs text-yellow-600 font-medium">
                              🏆 {index + 1}순위
                            </div>
                          )}
                        </div>
                      </div>

                      {day.reasons.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-sm text-gray-700">
                            <strong>길흉 요인:</strong>
                            <ul className="mt-1 space-y-1">
                              {day.reasons.map((reason, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="text-primary-600 mr-2">•</span>
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
};

export default TaekIlPage;
