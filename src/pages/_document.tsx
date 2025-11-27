import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@200;300;400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
        <meta name="description" content="한국 전통 사주팔자 해석 웹사이트" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
