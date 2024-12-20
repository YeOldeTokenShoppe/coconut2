import "../../styles/globals.css";
import "../../styles/RotatingText.css";
import "../../styles/Carousel.css";
import "../../styles/candle.css";
// import "../../styles/Carousel8.module.css";
import "../../styles/gradientEffect.css";
import "../../styles/matrix.css";
import "../../styles/RotatingText.css";
import "../../styles/shimmerbutton.css";
import "../../styles/wallpaper.css";
import "../../styles/sg.css";
import "../../styles/fireButton.css";
import "../../styles/sparkle.css";
import "../../styles/musicPlayer.css";
import "../../styles/coin.css";
import "../../styles/NeonSign.css";
import "../../styles/ScenePage.css";
import type { AppProps } from "next/app";
import { ThirdwebProvider } from "../utilities/thirdweb";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { defaultTheme, galleryTheme, sceneTheme } from "../utilities/theme";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Header2 from "../components/Header2";
import styles from "../../styles/MusicPlayer.module.css";
import Communion from "../components/Communion";
import Communion3 from "../components/Communion3";

import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const isGalleryPage = router.pathname === "/gallery";
  const isScenePage = router.pathname === "/scene";
  const isNumerologyPage = router.pathname === "/numerology";

  // Dynamically choose the theme
  const theme = isGalleryPage
    ? galleryTheme
    : isScenePage
    ? sceneTheme
    : defaultTheme;

  let HeaderComponent = null;
  if (isNumerologyPage) {
    HeaderComponent = Header2;
  } else {
    HeaderComponent = Header;
  }

  return (
    <>
      <ClerkProvider>
        <ThirdwebProvider>
          <ChakraProvider theme={theme}>
            <Head>
              <title>𝓞𝖚𝖗 𝕷𝖆𝖉𝖞 𝔬𝔣 𝕻𝖊𝖗𝖕𝖊𝖙𝖚𝖆𝖑 𝕻𝖗𝖔𝖋𝖎𝖙</title>
              <meta name="description" content="A token to believe in." />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
              />
            </Head>
            <div
              className={isScenePage ? "scene-page" : ""}
              style={{
                width: "100%",
                margin: "0",
              }}
            >
              {/* Render the Header dynamically */}
              {HeaderComponent && <HeaderComponent />}

              {/* Render the main page content */}
              <Component {...pageProps} />
            </div>
          </ChakraProvider>
        </ThirdwebProvider>
      </ClerkProvider>
    </>
  );
}
export default MyApp;
