import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#050b12" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="description" content="Shorly — Smart link shortener with powerful analytics. Shorten, track, and grow." />
        <meta property="og:title" content="Shorly — Smart Link Shortener" />
        <meta property="og:description" content="Shorten links. Track clicks. Grow your audience." />
        <meta property="og:image" content="/og-image.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
