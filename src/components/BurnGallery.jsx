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

  // const getFormattedImageUrl = (url) => {
  //   if (!url) return "";
  //   // Only modify Twitter URLs to get the 'bigger' size
  //   if (url.includes("pbs.twimg.com")) {
  //     return url.replace("_normal", ""); // Replace '_normal' with '_bigger' for a larger version
  //   }
  //   // Only add `?alt=media` for Firebase URLs
  //   if (url.includes("firebasestorage")) {
  //     return url.includes("alt=media") ? url : `${url}&alt=media`;
  //   }
  //   return url; // Return external URLs as-is
  // };
  // const displayImageWithFrame = (imageData) => {
  //   const { src, frameChoice } = imageData;
  //   return (
  //     <Box position="relative">
  //       <Image
  //         src={`/${frameChoice}.png`} // Apply the correct frame
  //         alt="Frame"
  //         position="absolute"
  //         top="0"
  //         zIndex="1"
  //       />
  //       <ChakraImage
  //         src={getFormattedImageUrl(src)}
  //         alt="Image"
  //         position="relative"
  //         zIndex="0"
  //       />
  //     </Box>
  //   );
  // };

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

  // const ImageBox = ({ image }) => {
  //   const imageUrl = getFormattedImageUrl(image.src);
  //   const frameChoice = image.frameChoice; // Use the frameChoice from Firestore

  //   const frameSrc = {
  //     frame0: "/frame0.png",
  //     frame1: "/frame1.png",
  //     frame2: "/frame2.png",
  //     frame3: "/frame3.png",
  //   }[frameChoice];

  //   const isAvatar = image.isFirstImage;
  //   return (
  //     <Box
  //       textAlign="center"
  //       mb={4}
  //       position="relative"
  //       width="100%"
  //       height="auto"
  //       p={2}
  //       display="flex"
  //       flexDirection="column"
  //       alignItems="center"
  //     >
  //       {image.type && (
  //         <Badge
  //           colorScheme={image.type === "Top Burner" ? "purple" : "cyan"}
  //           variant="solid"
  //           position="absolute"
  //           top="1rem"
  //           left="50%"
  //           transform="translateX(-50%)"
  //           m="1"
  //           zIndex="docked"
  //         >
  //           {image.type}
  //         </Badge>
  //       )}
  //       <Box
  //         position="relative"
  //         display="flex"
  //         flexDirection="column"
  //         justifyContent="center"
  //         alignItems="center"
  //         width={"10rem"} // Adjust size for avatar or other images
  //         height="auto"
  //       >
  //         {/* Conditionally display the frame if it's not a video or PNG image */}
  //         {!image.isVideo && !image.isPng && frameChoice && frameSrc && (
  //           <Image
  //             src={frameSrc}
  //             alt="Frame"
  //             position="absolute"
  //             top="1rem"
  //             left="0"
  //             width="10rem"
  //             height="10rem"
  //             objectFit="contain"
  //             zIndex="6"
  //           />
  //         )}

  //         {/* Display the image, video, or PNG */}
  //         {image.isVideo ? (
  //           <video
  //             src={imageUrl}
  //             autoPlay
  //             loop
  //             muted
  //             playsInline
  //             style={{
  //               width: "100%",
  //               height: "auto",
  //               zIndex: "5",
  //               position: "relative",
  //               top: "1rem",
  //             }}
  //           />
  //         ) : image.isPng ? (
  //           <Image
  //             src={imageUrl}
  //             alt={image.alt || "PNG image"}
  //             style={{
  //               width: "100%",
  //               height: "auto",
  //               zIndex: "5",
  //             }}
  //             s
  //           />
  //         ) : (
  //           <Image
  //             src={imageUrl || "/defaultAvatar.png"}
  //             alt={image.alt || "User image"}
  //             style={{
  //               width: isAvatar ? "7rem" : "70%", // Adjust the image size within the frame
  //               height: "auto",
  //               zIndex: "5",
  //               borderRadius: isAvatar ? "50%" : "0%", // Circular border for avatars
  //               position: "relative",
  //               top: isAvatar ? "2.5rem" : "2.5rem", // Adjust the position for avatars
  //             }}
  //           />
  //         )}
  //       </Box>
  //       <Box
  //         mt={image.isVideo || image.isPng ? 2 : "4.5rem"} // Adjust margin-top based on whether it's a video or PNG
  //         zIndex={image.isVideo || image.isPng ? "5" : "7"} // Ensure text is above the frame/image composite
  //       >
  //         <Text
  //           fontSize="small"
  //           fontWeight="bold"
  //           lineHeight="normal"
  //           textAlign="center"
  //           position={"relative"}
  //           top="=1rem"
  //         >
  //           {image.userName}
  //           <br />
  //           Burned: {image.burnedAmount} tokens
  //           <br />
  //           {image.message && (
  //             <Text color="lt grey" fontWeight="normal">
  //               "{image.message}"
  //             </Text>
  //           )}
  //         </Text>
  //       </Box>
  //     </Box>
  //   );
  // };
  // const { data: tokensBurned } = useReadContract({
  //   contract: contract,
  //   method: resolveMethod("getBurnedTokens"),
  //   params: [],
  // });

  // const totalSupply = 10000000000; // 10 billion
  // let burnedPercentage = 0;

  // if (tokensBurned) {
  //   burnedPercentage =
  //     (Number(utils.formatUnits(tokensBurned, "ether")) / totalSupply) * 100;
  // }

  // const [topBurners, setTopBurners] = useState([]);
  // const [recentSubmissions, setRecentSubmissions] = useState([]);

  // const fetchData = async () => {
  //   try {
  //     const q = query(collection(db, "results"), orderBy("createdAt", "desc"));
  //     const querySnapshot = await getDocs(q);

  //     const results = querySnapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));

  //     setTopBurners(results.slice(0, 3)); // Adjust as necessary
  //     setRecentSubmissions(results.slice(3, 6)); // Adjust as necessary
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  // fetchData();

  // const combinedImages = [...topBurners, ...recentSubmissions].map((image) => ({
  //   ...image,
  //   isVideo: image.src.endsWith(".mp4"), // Explicitly set if the image is a video
  //   frameChoice: image.frameChoice || (image.isFirstImage ? "frame1" : null), // Set frameChoice only if it's the first image
  // }));

  // function formatAndWrapNumber(number) {
  //   // Convert the number to a string and add commas as thousands separators
  //   let formattedNumber = number.toLocaleString();

  //   // Add a zero-width space after each character
  //   let breakableNumber = formattedNumber.split("").join("\u200B");

  //   return breakableNumber;
  // }

  // const ResponsiveStatGroup = styled(StatGroup)`
  //   display: flex;
  //   flex-wrap: wrap;
  //   justify-content: space-around;

  //   @media (max-width: 600px) {
  //     flex-direction: row;
  //   }
  // `;
  // const ResponsiveStat = styled(Stat)`
  //   flex-basis: 50%;

  //   @media (max-width: 600px) {
  //     margin: 10px;
  //     width: calc(50% - 20px);
  //   }
  // `;

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

        {/* Move content to the top right */}
        {/* <Box
          position="absolute"
          bottom={"-25%"}
          left="18%"
          zIndex={500} // Ensure it's above other layers
          textAlign="right"
          maxWidth="25%" // Optional: Adjust width if needed
          justifyContent="center"
          alignItems="center"
        >
          <h1
            className="thelma1"
            style={{ marginBottom: "1rem", marginTop: "8rem" }}
          >
            Peril & Piety
          </h1>
          <Text mb="2rem" mt="2rem">
            Prow scuttle parrel provost Sail ho shrouds spirits boom mizzenmast
            yardarm. Pinnace holystone mizzenmast quarter crow's nest nipperkin
            grog yardarm hempen halter furl.
          </Text>
          <Box
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
          </Box>
        </Box> */}

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
    </>
  );
}

export default BurnGallery;
