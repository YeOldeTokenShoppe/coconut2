import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html
      data-theme="dark"
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <Head>
        <title>𝓞𝖚𝖗 𝕷𝖆𝖉𝖞 𝔬𝔣 𝕻𝖊𝖗𝖕𝖊𝖙𝖚𝖆𝖑 𝕻𝖗𝖔𝖋𝖎𝖙</title>
        <meta name="description" content="A token to believe in." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />

        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r125/three.min.js"
          async
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
          rel="stylesheet"
        />
        <style>{`
          /* Prevent white flash by pre-setting styles */
          html {
            background-color: #000000 !important;
            color: white !important;
          }
  
        `}</style>
      </Head>

      <body style={{ colorScheme: "dark" }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
