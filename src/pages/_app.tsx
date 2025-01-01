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
import { ThemeProvider, useTheme } from "next-themes";
import { defaultTheme, galleryTheme, sceneTheme } from "../utilities/theme";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Header2 from "../components/Header2";
import styles from "../../styles/MusicPlayer.module.css";
import { Theme } from "@chakra-ui/react";
import { ClerkProvider } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";
import { useEffect } from "react";

type MyAppProps = AppProps & {
  Component: AppProps["Component"] & {
    theme?: string; // Add the `theme` property
  };
};

function MyApp({ Component, pageProps }: MyAppProps) {
  useEffect(() => {
    // Ensure theme is forced to "dark"
    const html = document.documentElement;
    html.setAttribute("data-theme", "dark");
    html.style.colorScheme = "dark";
    html.style.backgroundColor = "#000000";
    html.style.color = "white";
  }, []);
  const router = useRouter();

  const isGalleryPage = router.pathname === "/gallery";
  const isIndexPage = router.pathname === "/";
  const isNumerologyPage = router.pathname === "/numerology";
  const isCommunionPage = router.pathname === "/communion";
  const isScenePage = router.pathname === "/scene"; // Add this line
  const isRocketPage = router.pathname === "/rocket";
  function DebugTheme() {
    const { theme, resolvedTheme, systemTheme } = useTheme();

    console.log("Active theme:", theme);
    console.log("Resolved theme:", resolvedTheme);
    console.log("System theme:", systemTheme);

    return null;
  }
  // Dynamically choose the theme
  const special = isGalleryPage
    ? galleryTheme
    : isScenePage
    ? sceneTheme
    : defaultTheme;

  let HeaderComponent = null;
  if (isNumerologyPage) {
    HeaderComponent = Header2;
  } else if (!isIndexPage && !isScenePage && !isRocketPage && !isScenePage) {
    // Modify this line
    HeaderComponent = Header;
  }

  return (
    <>
      <ClerkProvider>
        <ThirdwebProvider>
          <ChakraProvider theme={special}>
            <div
              className={`${isGalleryPage ? "gallery-page" : ""} ${
                isScenePage ? "scene-page" : ""
              }`.trim()} // Dynamically add class names
              style={{
                backgroundColor: isGalleryPage
                  ? "#000000"
                  : isScenePage
                  ? "#0d0d0d"
                  : "transparent",
                width: isGalleryPage || isScenePage ? "100%" : "auto",
                margin: isGalleryPage || isScenePage ? "0" : "auto",
              }}
            >
              {/* Render the Header dynamically */}
              {HeaderComponent && <HeaderComponent />}
              <ThemeProvider
                defaultTheme="dark"
                enableSystem={false}
                attribute="data-theme"
                forcedTheme="dark"
                enableColorScheme={false}
                scriptProps={{
                  dangerouslySetInnerHTML: {
                    __html:
                      "document.documentElement.setAttribute('data-theme', 'dark');",
                  },
                }}
              >
                <DebugTheme />
                {/* Render the main page content */}
                <Component {...pageProps} />
              </ThemeProvider>
            </div>
          </ChakraProvider>
        </ThirdwebProvider>
      </ClerkProvider>
    </>
  );
}
export default MyApp;
