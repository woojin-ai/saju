import WorkerProbe from '@/components/WorkerProbe';
import Head from 'next/head';

export default function TestPage() {
  return (
    <>
      <Head>
        <title>Worker 진단 테스트</title>
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800 py-8">
        <div className="container mx-auto px-4">
          <WorkerProbe />
        </div>
      </div>
    </>
  );
}
