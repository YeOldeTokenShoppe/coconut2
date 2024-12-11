import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  VStack,
  Flex,
  IconButton,
  Button,
  useClipboard,
  Collapse,
} from "@chakra-ui/react";
import {
  CopyIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DragHandleIcon,
} from "@chakra-ui/icons";

const CameraControlPanel = ({ camera, controls }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0, z: 0 });
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (camera && controls) {
      setCameraPos({
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      });
      setTargetPos({
        x: controls.target.x,
        y: controls.target.y,
        z: controls.target.z,
      });
    }
  }, [camera, controls]);

  // Combined mouse and touch handling
  const handleDragStart = (e) => {
    if (e.target.closest("button")) return;

    const clientX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;

    setIsDragging(true);
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y,
    });
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;

    const clientX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;

    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const preventDefault = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove);
      window.addEventListener("touchend", handleDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, dragStart]);

  const { onCopy: onCopyAll, hasCopied: hasCopiedAll } = useClipboard(
    `{
  position: [${cameraPos.x.toFixed(3)}, ${cameraPos.y.toFixed(
      3
    )}, ${cameraPos.z.toFixed(3)}],
  target: [${targetPos.x.toFixed(3)}, ${targetPos.y.toFixed(
      3
    )}, ${targetPos.z.toFixed(3)}],
}`
  );

  const updateCamera = (newPos) => {
    if (camera) {
      camera.position.set(newPos.x, newPos.y, newPos.z);
      setCameraPos(newPos);
      controls?.update();
    }
  };

  const updateTarget = (newPos) => {
    if (controls) {
      controls.target.set(newPos.x, newPos.y, newPos.z);
      setTargetPos(newPos);
      controls.update();
    }
  };

  const renderAxis = (label, value, onChange, min = -20, max = 20) => {
    return (
      <Box mb={2} onContextMenu={preventDefault}>
        <Flex justify="space-between" mb={1}>
          <Text fontSize="sm" fontWeight="medium">
            {label}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {value.toFixed(3)}
          </Text>
        </Flex>
        <Slider
          value={value}
          min={min}
          max={max}
          step={0.1}
          onChange={onChange}
        >
          <SliderTrack onContextMenu={preventDefault}>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb onContextMenu={preventDefault} />
        </Slider>
      </Box>
    );
  };

  return (
    <Card
      maxW="sm"
      width="250px"
      boxShadow="lg"
      position="fixed"
      top={position.y}
      left={position.x}
      zIndex={100000}
      cursor={isDragging ? "grabbing" : "auto"}
      bg="white"
    >
      <CardHeader
        p={2}
        cursor="grab"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        userSelect="none"
        bg="gray.50"
        borderBottom="1px"
        borderColor="gray.200"
        _hover={{ bg: "gray.100" }}
      >
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={2} flex={1}>
            <DragHandleIcon color="gray.500" />
            {/* <Heading size="sm">Camera Controls</Heading> */}
          </Flex>
          <IconButton
            icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            variant="ghost"
            size="sm"
            aria-label={isExpanded ? "Collapse controls" : "Expand controls"}
            zIndex={100001}
          />
        </Flex>
      </CardHeader>
      <Collapse in={isExpanded}>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="sm" mb={4}>
                Camera Position
              </Heading>
              {renderAxis("X", cameraPos.x, (val) =>
                updateCamera({ ...cameraPos, x: val })
              )}
              {renderAxis("Y", cameraPos.y, (val) =>
                updateCamera({ ...cameraPos, y: val })
              )}
              {renderAxis(
                "Z",
                cameraPos.z,
                (val) => updateCamera({ ...cameraPos, z: val }),
                0,
                40
              )}
            </Box>

            <Box>
              <Heading size="sm" mb={4}>
                Look At Target
              </Heading>
              {renderAxis("X", targetPos.x, (val) =>
                updateTarget({ ...targetPos, x: val })
              )}
              {renderAxis("Y", targetPos.y, (val) =>
                updateTarget({ ...targetPos, y: val })
              )}
              {renderAxis("Z", targetPos.z, (val) =>
                updateTarget({ ...targetPos, z: val })
              )}
            </Box>

            <Button
              onClick={onCopyAll}
              leftIcon={<CopyIcon />}
              size="sm"
              width="100%"
              colorScheme="blue"
            >
              {hasCopiedAll ? "Copied!" : "Copy Camera Config"}
            </Button>
          </VStack>
        </CardBody>
      </Collapse>
    </Card>
  );
};

export default CameraControlPanel;
