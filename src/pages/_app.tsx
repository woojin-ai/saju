import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Script from 'next/script'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        src="//t1.daumcdn.net/kas/static/ba.min.js"
        strategy="afterInteractive"
      />
      <Component {...pageProps} />
    </>
  )
}
