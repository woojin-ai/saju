// useGoodDays.ts - Web Worker를 관리하는 React 훅
import { useEffect, useRef, useState, startTransition } from 'react';

export type GoodDay = {
  date: Date;
  ganji: string;
  ganjiKor: string;
  score: number;
  quality: string;
  reasons: string[];
};

export function useGoodDaysWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [progress, setProgress] = useState(0);
  const [items, setItems] = useState<GoodDay[]>([]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('');

  // StrictMode에서 이중 마운트로 워커 두 번 생성 방지 가드
  const createdRef = useRef(false);

  const ensureWorker = () => {
    if (workerRef.current) return workerRef.current;
    if (createdRef.current) return workerRef.current;
    createdRef.current = true;

    try {
      const w = new Worker(new URL('../workers/goodDays.worker.ts', import.meta.url), { 
        type: 'module' 
      });
      
      w.onmessage = (e: MessageEvent) => {
        const msg = e.data;
        
        if (msg.type === 'progress') {
          const progressPercent = Math.round((msg.done / msg.total) * 100);
          // 진행률 렌더는 비용이 작아야 하므로 startTransition 사용
          startTransition(() => {
            setProgress(progressPercent);
            setStatus(`${msg.done}/${msg.total}일 분석 중... (${progressPercent}%)`);
          });
        } else if (msg.type === 'chunk') {
          // 결과는 덩어리로 합치기 → 렌더 횟수 최소화
          startTransition(() => {
            setItems(prev => prev.concat(msg.items));
          });
        } else if (msg.type === 'done') {
          startTransition(() => {
            setRunning(false);
            setProgress(100);
            setStatus(`완료! 총 ${msg.total}일 분석`);
          });
        }
      };

      w.onerror = (error) => {
        console.error('Web Worker 오류:', error);
        setRunning(false);
        setStatus('계산 중 오류가 발생했습니다');
      };

      workerRef.current = w;
      return w;
    } catch (error) {
      console.error('Web Worker 생성 실패:', error);
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

    setItems([]);
    setProgress(0);
    setRunning(true);
    setStatus('계산 시작...');

    w.postMessage({
      saju: params.saju,
      startTs: new Date(params.startDate).setHours(0, 0, 0, 0),
      endTs: new Date(params.endDate).setHours(0, 0, 0, 0),
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

  useEffect(() => {
    return () => { 
      workerRef.current?.terminate(); 
      workerRef.current = null; 
      createdRef.current = false;
    };
  }, []);

  return { 
    progress, 
    items, 
    running, 
    status,
    start, 
    abort 
  };
}
