import {
  moonShader,
  flowingPatternShader,
  glitchyPlaid,
  spiralPatternShader,
  starShader,
} from "./videoShaders";

export const shaderEffects = [
  {
    name: "flowingPattern",
    shader: flowingPatternShader,
  },
  {
    name: "moon",
    shader: moonShader,
  },
  {
    name: "plaid",
    shader: glitchyPlaid,
  },
  {
    name: "spiral",
    shader: spiralPatternShader,
  },
  {
    name: "stars",
    shader: starShader,
  },
];

console.log("Shader effects array:", shaderEffects); // Add this line

export function getRandomShader() {
  const selected =
    shaderEffects[Math.floor(Math.random() * shaderEffects.length)];
  return selected;
}
