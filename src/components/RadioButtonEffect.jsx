import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "../../styles/RadioButton.module.css";

const RadioButton = ({ id, text, link }) => {
  const groupRef = useRef(null);
  const gContent = Array.from({ length: 25 }, (_, i) => (
    <rect key={i} x="-100%" y={i * 2} width="100%" height="2" />
  ));
  useEffect(() => {
    // Isolate the nodes for the current button
    const nodes = Array.from(groupRef.current.querySelectorAll("rect"));
    const randomNodes = Array.from(
      { length: 3 },
      () => nodes[Math.floor(Math.random() * nodes.length)]
    );
    // Initialize the animation for this button
    gsap.to(nodes, {
      duration: 0.8,
      ease: "elastic.out(1, 0.3)",
      x: "100%",
      stagger: 0.01,
      overwrite: true,
      //   repeat: -1,
    });

    gsap.fromTo(
      nodes,
      { fill: "#0c79f7" },
      {
        fill: "#76b3fa",
        duration: 0.01,
        ease: "elastic.out(1, 0.3)",
        // repeat: -1,
      }
    );

    // Animate a few random nodes

    gsap.to(randomNodes, {
      duration: 0.7,
      ease: "elastic.out(1, 0.3)",
      x: "100%",
      stagger: 0.1,
      repeatDelay: 1.5,
      repeat: -1,
    });
  }, []); // Runs once for each instance of the component

  // Generate rects dynamically for the current button

  return (
    <div className={styles.radioBtnGroup}>
      <input
        type="radio"
        // name={name}
        id={id}
        className={styles.inputRadio}
        defaultChecked
      />
      <label htmlFor={id} className={styles.label}>
        <a href={link} target="_blank" rel="noopener noreferrer">
          <span>{text}</span>
        </a>
        <svg
          className={styles.svg}
          height="100%"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g ref={groupRef}>{gContent}</g>
        </svg>
      </label>
    </div>
  );
};

export default RadioButton;
