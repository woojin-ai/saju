// useOptimizedGoodDays.ts - 개선된 사주 워커 훅
import { useEffect, useRef, useState, startTransition } from 'react';
import { makeSajuWorker } from '@/utils/makeSajuWorker';

export type OptimizedGoodDay = {
  timestamp: number;  // Date 대신 timestamp 사용
  ganji: string;
  ganjiKor: string;
  score: number;
  quality: string;
  reasons: string[];
};

export function useOptimizedGoodDays() {
  const workerRef = useRef<Worker | null>(null);
  const createdRef = useRef(false); // StrictMode 가드
  
  const [progress, setProgress] = useState(0);
  const [items, setItems] = useState<OptimizedGoodDay[]>([]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('');
  const [hotspots, setHotspots] = useState<Array<{timestamp: number, duration: number}>>([]);

  const ensureWorker = () => {
    if (workerRef.current) return workerRef.current;
    if (createdRef.current) return workerRef.current;
    createdRef.current = true;

    try {
      const w = makeSajuWorker();
      
      w.onmessage = (e: MessageEvent) => {
        const msg = e.data;
        
        if (msg.type === 'progress') {
          startTransition(() => {
            setProgress(msg.percent);
            setStatus(`${msg.done}/${msg.total}일 분석 중... (${msg.percent}%)`);
          });
        } else if (msg.type === 'chunk') {
          startTransition(() => {
            setItems(prev => {
              const combined = prev.concat(msg.items);
              // 실시간 정렬 (상위 1000개만 유지해서 메모리 최적화)
              combined.sort((a, b) => b.score - a.score);
              return combined.slice(0, 1000);
            });
          });
        } else if (msg.type === 'done') {
          startTransition(() => {
            setRunning(false);
            setProgress(100);
            setStatus(`완료! 총 ${msg.total}일 분석`);
          });
        } else if (msg.type === 'hotspot') {
          // 성능 핫스팟 감지
          setHotspots(prev => [...prev, {
            timestamp: msg.timestamp,
            duration: msg.duration
          }]);
        }
      };

      w.onerror = (error) => {
        console.error('Optimized Worker 오류:', error);
        setRunning(false);
        setStatus('계산 중 오류가 발생했습니다');
      };

      workerRef.current = w;
      return w;
    } catch (error) {
      console.error('Optimized Worker 생성 실패:', error);
      return null;
    }
  };

  const start = (params: {
    saju: any; 
    startDate: Date; 
    endDate: Date; 
    purpose: string;
    progressIntervalMs?: number;
  }) => {
    const w = ensureWorker();
    if (!w) {
      setStatus('Web Worker를 사용할 수 없습니다');
      return;
    }

    // 상태 초기화
    setItems([]);
    setProgress(0);
    setRunning(true);
    setStatus('계산 시작...');
    setHotspots([]);

    // UTC 기준으로 정규화하여 DST 문제 해결
    const startTs = Date.UTC(
      params.startDate.getFullYear(),
      params.startDate.getMonth(),
      params.startDate.getDate()
    );
    const endTs = Date.UTC(
      params.endDate.getFullYear(),
      params.endDate.getMonth(),
      params.endDate.getDate()
    );

    w.postMessage({
      saju: params.saju,
      startTs: startTs,
      endTs: endTs,
      purpose: params.purpose,
      progressIntervalMs: params.progressIntervalMs ?? 200,
    });
  };

  const abort = () => {
    if (workerRef.current) {
      workerRef.current.postMessage('abort');
    }
    setRunning(false);
    setStatus('계산이 취소되었습니다');
  };

  // 정리
  useEffect(() => {
    return () => { 
      if (workerRef.current) {
        workerRef.current.terminate(); 
        workerRef.current = null; 
      }
      createdRef.current = false;
    };
  }, []);

  // timestamp를 Date로 변환하는 헬퍼 함수
  const getDisplayItems = () => {
    return items.map(item => ({
      ...item,
      date: new Date(item.timestamp) // 표시용으로만 Date 변환
    }));
  };

  return { 
    progress, 
    items: getDisplayItems(), // 표시용 Date 포함
    rawItems: items, // 원본 timestamp 데이터
    running, 
    status,
    hotspots, // 성능 핫스팟 정보
    start, 
    abort 
  };
}
