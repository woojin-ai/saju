'use client';
import { useEffect, useRef, useState, startTransition } from 'react';
import { makeCounterWorker } from '@/utils/makeWorker';

// 0단계 진단: 워커 연결 테스트 컴포넌트
export default function WorkerProbe() {
  const wRef = useRef<Worker | null>(null);
  const createdRef = useRef(false); // StrictMode 이중 실행 가드
  
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('준비');
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), `[${timestamp}] ${message}`]);
  };

  const start = () => {
    // 기존 워커 정리
    if (createdRef.current && wRef.current) {
      wRef.current.terminate();
      wRef.current = null;
    }
    
    createdRef.current = true;
    
    try {
      addLog('🚀 Blob 워커 생성 시작...');
      const w = makeCounterWorker();
      
      w.onmessage = (e) => {
        const msg = e.data;
        
        if (msg.type === 'progress') {
          startTransition(() => {
            setProgress(msg.percent || 0);
            setStatus(`진행 중: ${msg.done}/${msg.total} (${msg.percent}%)`);
          });
        } else if (msg.type === 'done') {
          addLog(`✅ 완료: 총 ${msg.total}건 처리`);
          setRunning(false);
          setStatus(`완료: ${msg.total}건`);
        }
      };
      
      w.onerror = (error) => {
        addLog(`❌ 워커 오류: ${error.message}`);
        setRunning(false);
        setStatus('오류 발생');
      };
      
      wRef.current = w;
      setRunning(true);
      setProgress(0);
      setStatus('시작...');
      addLog('📤 워커에 작업 전송...');
      
      // 3년치 시뮬레이션 (1095일)
      w.postMessage({ 
        total: 365 * 3, 
        interval: 150 
      });
      
      addLog('⏳ 계산 시작됨');
      
    } catch (error) {
      addLog(`❌ 워커 생성 실패: ${error}`);
      setStatus('워커 생성 실패');
    }
  };

  const abort = () => {
    if (wRef.current) {
      addLog('🛑 중단 요청...');
      wRef.current.postMessage('abort');
    }
    setRunning(false);
    setStatus('중단됨');
  };

  useEffect(() => {
    return () => {
      if (wRef.current) {
        wRef.current.terminate();
        wRef.current = null;
      }
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🔬 Worker 연결 진단 테스트
      </h2>
      
      <div className="space-y-4">
        {/* 컨트롤 버튼들 */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={start}
            disabled={running}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              running 
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {running ? '실행 중...' : '🚀 테스트 시작 (3년치)'}
          </button>
          
          <button
            onClick={abort}
            disabled={!running}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              !running 
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            🛑 중단
          </button>
        </div>

        {/* 진행률 표시 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">진행률</span>
            <span className="text-sm text-gray-600">{status}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center text-lg font-bold text-blue-600">
            {progress}%
          </div>
        </div>

        {/* 로그 영역 */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="text-sm font-medium mb-2">📋 실행 로그</div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-sm">로그가 여기에 표시됩니다...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-xs font-mono text-gray-700">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 결과 해석 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-800 mb-2">📊 결과 해석</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <div>✅ <strong>100%까지 매끄럽게 진행</strong> → 워커/렌더 배선 정상, 실제 계산 로직 점검 필요</div>
            <div>❌ <strong>중간에 멈춤</strong> → Next.js 번들/워커 로딩/렌더 병목 문제</div>
            <div>⚠️ <strong>워커 생성 실패</strong> → 브라우저 호환성 또는 Next.js 설정 문제</div>
          </div>
        </div>
      </div>
    </div>
  );
}
