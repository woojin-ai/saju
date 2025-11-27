// makeSajuWorker.ts - 개선된 Blob 방식 사주 워커
export function makeSajuWorker(): Worker {
  const code = `
    let abort = false;
    
    // 한 번만 계산하고 재사용할 상수들
    const CHEONGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const CHEONGAN_KOR = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
    const JIJI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const JIJI_KOR = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
    
    // 정확한 간지 계산 (기준일: 1900-01-01 = 경자)
    const BASE_TIMESTAMP = new Date(1900, 0, 1).getTime();
    const DAY_MS = 24 * 60 * 60 * 1000;
    
    function getDayGanji(timestamp) {
      try {
        // UTC 기준으로 정규화 (DST 문제 해결)
        const utcDate = new Date(timestamp);
        const utcTs = Date.UTC(utcDate.getFullYear(), utcDate.getMonth(), utcDate.getDate());
        const daysSince1900 = Math.floor((utcTs - BASE_TIMESTAMP) / DAY_MS);
        
        // 1900-01-01이 경자(庚子)이므로 36번째
        const ganjiIndex = (daysSince1900 + 36) % 60;
        const cheonganIdx = ganjiIndex % 10;
        const jijiIdx = ganjiIndex % 12;
        
        return {
          cheongan: CHEONGAN[cheonganIdx],
          jiji: JIJI[jijiIdx],
          cheonganKor: CHEONGAN_KOR[cheonganIdx],
          jijiKor: JIJI_KOR[jijiIdx]
        };
      } catch (error) {
        return {
          cheongan: '甲', jiji: '子',
          cheonganKor: '갑', jijiKor: '자'
        };
      }
    }
    
    function analyzeDayQuality(saju, timestamp, purpose) {
      const t0 = performance.now(); // 성능 모니터링
      
      try {
        const date = new Date(timestamp);
        const dayGanji = getDayGanji(timestamp);
        
        let score = 50;
        const reasons = [];
        
        // 요일별 점수
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          if (purpose === 'wedding') {
            score += 15;
            reasons.push('주말로 결혼식에 적합');
          }
        } else {
          if (purpose === 'business' || purpose === 'contract') {
            score += 10;
            reasons.push('평일로 사업/계약에 적합');
          }
        }
        
        // 날짜별 길흉 (더 정교한 계산)
        const day = date.getDate();
        const month = date.getMonth() + 1;
        
        if ([1, 3, 6, 8, 11, 13, 16, 18, 21, 23, 26, 28].includes(day)) {
          score += 8;
          reasons.push('길한 날짜');
        }
        
        // 계절별 보정
        if ([4, 5, 6, 9, 10].includes(month)) {
          score += 5;
          reasons.push('좋은 계절');
        }
        
        // 목적별 세밀한 보정
        if (purpose === 'wedding') {
          if (month >= 4 && month <= 6) {
            score += 10;
            reasons.push('혼례 적기');
          }
          if (dayOfWeek === 6) { // 토요일 추가 보너스
            score += 5;
            reasons.push('토요일 혼례');
          }
        } else if (purpose === 'moving') {
          if ([3, 4, 5, 9, 10, 11].includes(month)) {
            score += 8;
            reasons.push('이사 적기');
          }
        } else if (purpose === 'business') {
          if ([1, 2, 3, 8, 9].includes(month)) {
            score += 8;
            reasons.push('개업 적기');
          }
        }
        
        // 간지 기반 추가 계산 (간단화)
        const ganIdx = CHEONGAN.indexOf(dayGanji.cheongan);
        const jiIdx = JIJI.indexOf(dayGanji.jiji);
        
        if ([0, 2, 4, 6, 8].includes(ganIdx)) { // 양간
          score += 3;
          reasons.push('양의 기운');
        }
        
        if ([0, 3, 6, 9].includes(jiIdx)) { // 사정방
          score += 5;
          reasons.push('사정방 길일');
        }
        
        score = Math.max(0, Math.min(100, score));
        
        let quality = '';
        if (score >= 85) quality = '대길';
        else if (score >= 70) quality = '길';
        else if (score >= 50) quality = '평';
        else if (score >= 35) quality = '소흉';
        else quality = '흉';
        
        const dt = performance.now() - t0;
        if (dt > 5) { // 5ms 이상 걸리면 핫스팟 보고
          postMessage({ 
            type: 'hotspot', 
            timestamp: timestamp, 
            duration: dt 
          });
        }
        
        // Date 객체 대신 timestamp만 반환 (Structured Clone 최적화)
        return {
          timestamp: timestamp,
          ganji: dayGanji.cheongan + dayGanji.jiji,
          ganjiKor: dayGanji.cheonganKor + dayGanji.jijiKor,
          score: score,
          quality: quality,
          reasons: reasons.slice(0, 3) // 최대 3개로 제한
        };
        
      } catch (error) {
        return {
          timestamp: timestamp,
          ganji: '갑자',
          ganjiKor: '갑자',
          score: 50,
          quality: '평',
          reasons: ['분석 오류']
        };
      }
    }
    
    onmessage = (e) => {
      if (e.data === 'abort') {
        abort = true;
        return;
      }
      
      const { saju, startTs, endTs, purpose, progressIntervalMs = 200 } = e.data;
      abort = false;
      
      const totalDays = Math.floor((endTs - startTs) / DAY_MS) + 1;
      let currentTs = startTs;
      let processed = 0;
      let lastProgressTime = 0;
      const chunkSize = 100; // 100건씩 배치 처리
      let chunk = [];
      
      const sendProgress = () => {
        const now = performance.now();
        if (now - lastProgressTime >= progressIntervalMs) {
          postMessage({
            type: 'progress',
            done: processed,
            total: totalDays,
            percent: Math.round((processed / totalDays) * 100)
          });
          lastProgressTime = now;
        }
      };
      
      const processChunk = () => {
        if (abort) return;
        
        // chunkSize만큼 처리
        for (let i = 0; i < chunkSize && currentTs <= endTs && !abort; i++) {
          const result = analyzeDayQuality(saju, currentTs, purpose);
          chunk.push(result);
          processed++;
          currentTs += DAY_MS; // 정확히 하루씩 증가
        }
        
        // 청크 전송
        if (chunk.length > 0) {
          postMessage({
            type: 'chunk',
            items: chunk
          });
          chunk = [];
        }
        
        // 진행률 업데이트
        sendProgress();
        
        // 완료 체크
        if (currentTs > endTs || processed >= totalDays) {
          postMessage({
            type: 'done',
            total: processed
          });
        } else {
          // 다음 청크를 비동기로 처리 (메인 스레드 블로킹 방지)
          setTimeout(processChunk, 0);
        }
      };
      
      // 시작
      processChunk();
    };
  `;
  
  const blob = new Blob([code], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  return new Worker(url);
}
