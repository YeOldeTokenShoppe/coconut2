"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Accordion,
  Avatar,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Link,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  Grid,
  GridItem,
  Badge,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../utilities/firebaseClient";
import dynamic from "next/dynamic";
import { resolveMethod, createThirdwebClient, getContract } from "thirdweb";
import { useReadContract } from "thirdweb/react";
import { defineChain } from "thirdweb/chains";
import { utils, ethers } from "ethers";
import styled from "styled-components";
import Candle from "../components/Candle";
import { useUser, useClerk } from "@clerk/nextjs";
// import DoorComponent from "./Door";
// import GLBViewer from "./3dObject";
import Scene from "./3dChandelier";
import ThreeDVotiveStand from "./3DVotiveStand/index";

import NeonSign from "./NeonSign";

const BurnModal = dynamic(() => import("./BurnModal"), {
  ssr: false,
});
const ImageSelectionModal = dynamic(() => import("./ImageSelectionModal"), {
  ssr: false,
});

const infuraKey = process.env.NEXT_PUBLIC_INFURA_KEY;
const provider = new ethers.providers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${infuraKey}`
);

const CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

const client = createThirdwebClient({ clientId: CLIENT_ID });

const contract = getContract({
  client: client,
  chain: defineChain(11155111),
  address: "0xde7Cc5B93e0c1A2131c0138d78d0D0a33cc36e42",
});
function BurnGallery({ setBurnGalleryLoaded }) {
  useEffect(() => {
    // Simulate async data or image loading
    const loadBurnGalleryContent = async () => {
      // Example: simulate loading (replace with real logic)
      await new Promise((resolve) => setTimeout(resolve, 500));
      setBurnGalleryLoaded(true); // Notify parent that loading is complete
    };

    loadBurnGalleryContent();
  }, [setBurnGalleryLoaded]);
  const router = useRouter();
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);
  const [isImageSelectionModalOpen, setIsImageSelectionModalOpen] =
    useState(false);
  const [isResultSaved, setIsResultSaved] = useState(false); // Define isResultSaved here
  const [saveMessage, setSaveMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  // const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const currentUrl = router.asPath;
  const [burnedAmount, setBurnedAmount] = useState(0); // Already defined in BurnGallery
  const [images, setImages] = useState([]);
  const [isFlameVisible, setIsFlameVisible] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [isChandelierVisible, setIsChandelierVisible] = useState(true);
  const [isInMarkerView, setIsInMarkerView] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");
  const [marginTop, setMarginTop] = useState("17rem");
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 576;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setMarginTop("7rem");
      } else {
        setMarginTop("17rem");
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call the function initially to set the correct style

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Ensure we capture the current path correctly, fallback to the root if router is not ready
    const path = router.asPath;
    if (path) {
      setCurrentPath(path);
    }
  }, [router.asPath]);

  useEffect(() => {
    if (isChandelierVisible) {
      setIsMounted(true);
      // Wait a frame before starting fade-in
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      // Delay unmounting until fade-out completes
      const timer = setTimeout(() => setIsMounted(false), 2500); // Match your GSAP duration
      return () => clearTimeout(timer);
    }
  }, [isChandelierVisible]);

  const avatarUrl = user ? user.imageUrl : "/defaultAvatar.png"; // Define avatarUrl here

  const handleOpenBurnModal = () => {
    if (!user) {
      openSignIn({ forceRedirectUrl: currentPath });
    } else {
      setIsBurnModalOpen(true); // Open the BurnModal if signed in
      router.push("/gallery?burnModal=open", undefined, { shallow: true });
    }
  };

  const handleOpenImageSelectionModal = () =>
    setIsImageSelectionModalOpen(true);
  const handleCloseImageSelectionModal = () =>
    setIsImageSelectionModalOpen(false);

  useEffect(() => {
    if (isBurnModalOpen && router.query.burnModal !== "open") {
      router.push("/gallery?burnModal=open", undefined, { shallow: true });
    } else if (!isBurnModalOpen && router.query.burnModal === "open") {
      router.push("/gallery", undefined, { shallow: true });
    }
  }, [isBurnModalOpen]);

  const handleSignIn = (userInfo) => {
    // Update the user state after successful sign-in
    setUser(userInfo);
    setIsSignedIn(true);
    setIsAuthModalOpen(false); // Close the AuthModal
  };

  return (
    <>
      <Box py="0" position="relative" height="100vh" width="100%">
        <Grid gap={0} width="100%">
          <GridItem width="100%" zIndex={isChandelierVisible ? 5 : 3}>
            {!isMobile && isMounted && <Scene visible={isVisible} />}
          </GridItem>

          <GridItem width="100%" zIndex={4}>
            <ThreeDVotiveStand
              isMobile={isMobile}
              setIsLoading={() => setIsLoading(true)}
              onCameraMove={() => {
                setIsInMarkerView(true);
                setIsChandelierVisible(false);
              }}
              onResetView={() => {
                setIsInMarkerView(false);
                // Only show chandelier on reset if not mobile
                setIsChandelierVisible(!isMobile);
              }}
              onZoom={() => {
                if (!isInMarkerView) {
                  setIsChandelierVisible(false);
                }
              }}
            />
          </GridItem>
        </Grid>
        <Box>
          {isMobile && (
            <Box
              position="absolute"
              top="10%"
              // left="18%"
              zIndex={500} // Ensure it's above other layers
              textAlign="right"
              width="100%"
              justifyContent="center"
              alignItems="center"
            >
              <h1 className="thelma1">Peril & Piety</h1>
              <Text margin="2rem" fontSize={"1rem"}>
                Prow scuttle parrel provost Sail ho shrouds spirits boom
                mizzenmast yardarm. Pinnace holystone mizzenmast quarter crow's
                nest nipperkin grog yardarm hempen halter furl.
              </Text>
            </Box>
          )}
          {/* <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={5}
            mb={5}
          >
            <Button
              width="7rem"
              className="burnButton"
              onClick={handleOpenBurnModal}
            >
              Burn Tokens
            </Button>
          </Box> */}
          {/* </Box>  */}

          {isBurnModalOpen && (
            <BurnModal
              isOpen={isBurnModalOpen}
              onClose={() => setIsBurnModalOpen(false)}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              burnedAmount={burnedAmount}
              setBurnedAmount={setBurnedAmount}
              setIsResultSaved={setIsResultSaved}
              setSaveMessage={setSaveMessage}
              isResultSaved={isResultSaved}
              saveMessage={saveMessage}
            />
          )}
        </Box>
      </Box>
    </>
  );
}

export default BurnGallery;
