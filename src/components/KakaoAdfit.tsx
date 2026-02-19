import { useEffect } from 'react'

interface KakaoAdfitProps {
  adUnit: string
  adWidth: string
  adHeight: string
  className?: string
}

export default function KakaoAdfit({ adUnit, adWidth, adHeight, className = '' }: KakaoAdfitProps) {
  useEffect(() => {
    // SDK가 ins 태그를 자동으로 처리함
  }, [])

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={adUnit}
        data-ad-width={adWidth}
        data-ad-height={adHeight}
      />
    </div>
  )
}
