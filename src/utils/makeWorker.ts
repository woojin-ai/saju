// makeWorker.ts - Blob 워커로 Next.js 번들 문제 우회
export function makeCounterWorker(): Worker {
  const code = `
    let abort = false;
    onmessage = (e) => {
      if (e.data === 'abort') { 
        abort = true; 
        return; 
      }
      
      const { total = 365, interval = 200 } = e.data || {};
      let i = 0;
      let lastProgressTime = 0;
      
      const tick = () => {
        if (abort) return;
        
        // 가짜 일 256개씩 뭉텅이 처리 (실제 계산 시뮬레이션)
        for (let k = 0; k < 256 && i < total; k++) {
          i++;
          // 간단한 가짜 계산으로 시뮬레이션
          Math.sqrt(i * 123 + 456) * Math.sin(i / 100);
        }
        
        const now = performance.now();
        if (now - lastProgressTime >= interval) {
          postMessage({ 
            type: 'progress', 
            done: i, 
            total: total,
            percent: Math.round((i / total) * 100)
          });
          lastProgressTime = now;
        }
        
        if (i >= total) {
          postMessage({ 
            type: 'done', 
            total: i 
          });
        } else {
          // setTimeout을 사용해서 스케줄링 보장 확인
          setTimeout(tick, 0);
        }
      };
      
      // 시작
      tick();
    };
  `;
  
  const blob = new Blob([code], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  
  try {
    // 일부 브라우저에서는 type: 'module' 생략 필요
    return new Worker(url);
  } catch (error) {
    console.error('Worker 생성 실패:', error);
    throw error;
  }
}
