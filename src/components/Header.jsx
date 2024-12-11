"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import {
  useUser,
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs"; // Import Clerk components
import { Button, Container } from "@chakra-ui/react";
import Link from "next/link";
import { slide as Menu } from "react-burger-menu";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Import Firestore methods
import { signInWithCustomToken } from "firebase/auth"; // Import Firebase auth methods
import { db, auth } from "../utilities/firebaseClient"; // Import Firestore and Auth setup
import RotatingBadge2 from "./RotatingBadge2";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuWidth, setMenuWidth] = useState("35%");
  const [emoji, setEmoji] = useState("😇");
  const node = useRef();
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState(router.asPath); // Use router.asPath to track the current URL path
  const { isLoaded, isSignedIn, user } = useUser(); // Access the user object from Clerk
  const { getToken } = useAuth(); // Get Clerk auth token

  // Capture the current path before page has loaded
  useEffect(() => {
    // Ensure we capture the current path correctly, fallback to the root if router is not ready
    const path = router.asPath;
    if (path) {
      setCurrentPath(path);
    }
  }, [router.asPath]);

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = (event) => {
    event.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  // Firebase sign-in logic using Clerk's custom token
  const signIntoFirebaseWithClerk = async () => {
    try {
      const token = await getToken({ template: "integration_firebase" });
      if (!token) throw new Error("No Firebase token from Clerk.");

      console.log("JWT token from Clerk:", token);

      const userCredentials = await signInWithCustomToken(auth, token || "");
      console.log("User:", userCredentials.user);

      return userCredentials.user; // Return the authenticated User
    } catch (error) {
      console.error("Error signing into Firebase:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (node.current && !node.current.contains(e.target)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [node]);

  useEffect(() => {
    const emojiInterval = setInterval(() => {
      setEmoji((prevEmoji) => (prevEmoji === "😇" ? "😈" : "😇"));
    }, 3000);

    return () => clearInterval(emojiInterval);
  }, []);

  // Save user data to Firestore and sign into Firebase
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const userData = {
        username:
          user.username ||
          user.firstName ||
          user.emailAddresses[0]?.emailAddress ||
          "Anonymous",
        profileImage: user.imageUrl || null,
        userId: user.id,
      };

      const saveUserDataToFirestore = async () => {
        try {
          // Sign into Firebase first
          const firebaseUser = await signIntoFirebaseWithClerk();
          if (!firebaseUser) {
            console.error("Firebase sign-in failed");
            return;
          }

          // Proceed to save user data to Firestore
          const docRef = doc(db, "users", user.id); // Reference to user document
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            console.log("User already exists in Firestore:", docSnap.data());
          } else {
            await setDoc(docRef, userData, { merge: true });
            console.log("User data saved to Firestore");
          }
        } catch (error) {
          console.error("Error saving user data to Firestore:", error);
        }
      };

      saveUserDataToFirestore();
    }
  }, [isLoaded, isSignedIn, user]);

  // Update menu width based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth <= 760) {
          setMenuWidth("100%");
        } else {
          setMenuWidth("35%");
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      handleResize();
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  return (
    <>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Container
          className="header"
          maxW="1200px"
          mb="125px"
          style={{ position: "relative", zIndex: "100" }}
        >
          <header id="header">
            <div className="menu-icon" onClick={toggleMenu}></div>
            <div className="menu-wrapper">
              <div className="logo-menu-container">
                <div id="logo">
                  <img
                    className="logo"
                    src="./newheart1.png"
                    width="10rem"
                    height="10rem"
                    alt="Logo"
                    style={{ zIndex: "1" }}
                  />
                  <RotatingBadge2 />
                </div>
              </div>

              <div ref={node}>
                <Menu
                  isOpen={menuOpen}
                  onStateChange={({ isOpen }) => setMenuOpen(isOpen)}
                  width={menuWidth}
                >
                  <Link
                    href="/home"
                    className="menu-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/thesis"
                    className="menu-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    Unorthodoxy
                  </Link>
                  <Link
                    href="/numerology"
                    className="menu-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    Numerology
                  </Link>
                  <Link
                    href="/gallery"
                    className="menu-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    Peril and Piety
                  </Link>
                  <Link
                    href="/communion"
                    className="menu-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    Communion
                  </Link>
                </Menu>
              </div>

              <div
                id="sign-in-button"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "2.5rem",
                  objectFit: "cover",
                  layout: "fill",
                  right: "5%",
                  border: "3px solid goldenrod",
                  background: "#444",
                  position: "absolute",
                  width: "3rem",
                  height: "3rem",
                  minWidth: "3rem",
                  top: "3rem",
                  zIndex: "1",
                  overflow: "hidden",
                }}
              >
                <SignedIn>
                  <SignOutButton redirectUrl={currentPath}>
                    <UserButton afterSignOutUrl={currentPath} />
                  </SignOutButton>
                </SignedIn>

                <SignedOut>
                  <SignInButton mode="modal" forceRedirectUrl={currentPath}>
                    <Button style={{ fontSize: "2rem" }}>{emoji}</Button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
          </header>
        </Container>
      </div>
    </>
  );
}

export default Header;
