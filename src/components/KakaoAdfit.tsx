import { useEffect, useRef } from 'react'

interface KakaoAdfitProps {
  className?: string
}

declare global {
  interface Window {
    kakaoAdfitLoaded?: boolean
  }
}

export default function KakaoAdfit({ className = '' }: KakaoAdfitProps) {
  const insRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // SDK는 _document.tsx에서 로드됨 - ins 태그만 렌더링하면 자동 적용
  }, [])

  return (
    <div className={`flex justify-center items-start ${className}`}>
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit="DAN-b1xM3yfAHSGRrEka"
        data-ad-width="160"
        data-ad-height="600"
      />
    </div>
  )
}
