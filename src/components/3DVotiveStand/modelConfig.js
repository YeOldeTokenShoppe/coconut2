export const MODEL_SETTINGS = {
  modelCenter: {
    x: 0,
    y: 10.54,
    z: 0,
  },
  cachedCenter: null,
  getTargetPosition: (screenCategory) => {
    const settings = DEFAULT_CAMERA[screenCategory];
    const center = MODEL_SETTINGS.modelCenter;

    // Cache the result
    if (!MODEL_SETTINGS.cachedCenter) {
      MODEL_SETTINGS.cachedCenter = [
        center.x + settings.target[0],
        center.y + settings.target[1],
        center.z + settings.target[2],
      ];
    }
    return MODEL_SETTINGS.cachedCenter;
  },
};
