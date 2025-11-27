// goodDays.worker.ts - Web Worker로 메인 스레드에서 분리
export type WorkRequest = {
  saju: any;
  startTs: number;          // Date 대신 number(Epoch)로 오버헤드 감소
  endTs: number;
  purpose: string;
  stepDays?: number;        // 기본 1일씩
  progressIntervalMs?: number; // 진행률 전송 최소 간격(기본 200ms)
};

export type WorkProgress = {
  type: 'progress';
  done: number;
  total: number;
};

export type WorkChunk = {
  type: 'chunk';
  items: any[];             // 부분 결과
};

export type WorkDone = {
  type: 'done';
  total: number;
};

let abort = false;

self.onmessage = (e: MessageEvent) => {
  if (e.data === 'abort') { 
    abort = true; 
    return; 
  }

  const {
    saju, startTs, endTs, purpose,
    stepDays = 1, progressIntervalMs = 200
  } = e.data as WorkRequest;

  abort = false;

  const total = Math.floor((endTs - startTs) / (24*60*60*1000)) + 1;
  const chunkOut: any[] = [];
  let done = 0;
  let lastProgressTs = 0;

  // 가벼운 날짜 증가: number로만 이동
  let cur = startTs;

  const analyzeDayQuality = (s: any, dayTs: number, p: string) => {
    try {
      const targetDate = new Date(dayTs);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;
      const day = targetDate.getDate();
      
      // 최적화된 간지 계산
      const dayGanji = getDayGanjiOptimized(year, month, day);
      
      let score = 50; // 기본 점수
      const reasons: string[] = [];
      
      // 요일별 점수 (간단화)
      const dayOfWeek = targetDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // 주말
        if (p === 'wedding') {
          score += 15;
          reasons.push('주말로 결혼식에 적합');
        }
      } else { // 평일
        if (p === 'business' || p === 'contract') {
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
      if (p === 'wedding' && month >= 4 && month <= 6) {
        score += 10;
        reasons.push('혼례에 좋은 계절');
      } else if (p === 'moving' && (month >= 3 && month <= 5 || month >= 9 && month <= 11)) {
        score += 8;
        reasons.push('이사에 좋은 계절');
      }
      
      // 점수 범위 조정
      score = Math.max(0, Math.min(100, score));
      
      // 등급 결정
      let quality = '';
      if (score >= 80) quality = '대길';
      else if (score >= 65) quality = '길';
      else if (score >= 50) quality = '평';
      else if (score >= 35) quality = '소흉';
      else quality = '흉';
      
      return {
        date: targetDate,
        ganji: `${dayGanji.cheongan}${dayGanji.jiji}`,
        ganjiKor: `${dayGanji.cheonganKor}${dayGanji.jijiKor}`,
        score: score,
        quality: quality,
        reasons: reasons.length > 3 ? reasons.slice(0, 3) : reasons
      };
    } catch (error) {
      // 오류 시 기본값 반환
      return {
        date: new Date(dayTs),
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
      const CHEONGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const CHEONGAN_KOR = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
      const JIJI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      const JIJI_KOR = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
      
      const baseYear = 2000;
      const baseMonth = 1;
      const baseDay = 1;
      
      const yearDiff = year - baseYear;
      const monthDiff = month - baseMonth;
      const dayDiff = day - baseDay;
      
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
      return {
        cheongan: '甲',
        jiji: '子',
        cheonganKor: '갑',
        jijiKor: '자'
      };
    }
  };

  const postProgressThrottled = () => {
    const now = performance.now();
    if (now - lastProgressTs >= progressIntervalMs) {
      (self as any).postMessage({ type: 'progress', done, total } as WorkProgress);
      lastProgressTs = now;
    }
  };

  // 메인 루프 - 청크 단위로 처리
  const stepMs = stepDays * 24*60*60*1000;
  while (cur <= endTs && !abort) {
    // 한 번에 50건씩 처리 → postMessage 횟수 최소화
    for (let i = 0; i < 50 && cur <= endTs && !abort; i++) {
      const res = analyzeDayQuality(saju, cur, purpose);
      chunkOut.push(res);
      done++;
      cur += stepMs;
    }

    // 부분 결과 전달
    if (chunkOut.length) {
      (self as any).postMessage({ type: 'chunk', items: chunkOut.splice(0) } as WorkChunk);
    }

    // 진행률 간헐 보고(200ms 기준)
    postProgressThrottled();
  }

  if (!abort) {
    (self as any).postMessage({ type: 'done', total: done } as WorkDone);
  }
};
