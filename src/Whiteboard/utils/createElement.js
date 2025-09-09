import rough from "roughjs/bundled/rough.esm";
import { toolTypes } from "../../constants";
import { emitElementUpdate } from "../../socketConn/socketConn";

const generator = rough.generator();

const generateRectangle = ({ x1, y1, x2, y2, color }) => {
  console.log("generateRectangle called with color:", color);
  return generator.rectangle(x1, y1, x2 - x1, y2 - y1, {
    fill: color || "red",
    stroke: color || "red",
    hachureAngle: 60,
    hachureGap: 8,
    fillStyle: "hachure", // Make sure this is consistent
  });
};

const generateLine = ({ x1, y1, x2, y2, color }) => {
  // Ensure we have a valid color
  const strokeColor = color || "#000000";

  return generator.line(x1, y1, x2, y2, {
    stroke: strokeColor,
    strokeWidth: 2,
    roughness: 1,
  });
};

const generateCircle = ({ x1, y1, x2, y2, color }) => {
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  const centerX = Math.min(x1, x2) + width / 2;
  const centerY = Math.min(y1, y2) + height / 2;
  const radius = Math.max(width, height) / 2;

  return generator.circle(centerX, centerY, radius * 2, {
    fill: color || "blue",
    stroke: color || "blue",
    hachureAngle: 60,
    hachureGap: 8,
  });
};

const generateTriangle = ({ x1, y1, x2, y2, color }) => {
  // Ensure the coordinates are valid numbers AND not identical
  if (
    isNaN(x1) ||
    isNaN(y1) ||
    isNaN(x2) ||
    isNaN(y2) ||
    (x1 === x2 && y1 === y2)
  ) {
    console.error("Invalid coordinates for triangle:", { x1, y1, x2, y2 });
    // Return a minimal triangle that won't cause issues
    return generator.polygon(
      [
        [x1, y1],
        [x1 + 1, y1],
        [x1, y1 + 1],
      ],
      {
        fill: color || "#FFD700",
        stroke: color || "#FFD700",
        fillStyle: "hachure",
        hachureAngle: 60,
        hachureGap: 8,
        roughness: 1,
      }
    );
  }

  // Calculate the width and height
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);

  // If width or height is too small, create a minimal triangle
  if (width < 2 && height < 2) {
    return generator.polygon(
      [
        [x1, y1],
        [x1 + 2, y1],
        [x1 + 1, y1 + 2],
      ],
      {
        fill: color || "#FFD700",
        stroke: color || "#FFD700",
        fillStyle: "hachure",
        hachureAngle: 60,
        hachureGap: 8,
        roughness: 1,
      }
    );
  }

  // Calculate the triangle points properly
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  // Calculate the third point of the triangle (apex at the top center)
  const x3 = minX + width / 2; // Center of the base
  const y3 = minY; // Top of the triangle

  // Create the triangle path with proper coordinates
  return generator.polygon(
    [
      [minX, maxY], // Bottom left point
      [maxX, maxY], // Bottom right point
      [x3, y3], // Top point (apex)
    ],
    {
      fill: color || "#FFD700",
      stroke: color || "#FFD700",
      fillStyle: "hachure",
      hachureAngle: 60,
      hachureGap: 8,
      roughness: 1,
    }
  );
};

// Update createElement to include color
export const createElement = ({
  x1,
  y1,
  x2,
  y2,
  toolType,
  id,
  text,
  src,
  roomID,
  color,
}) => {
  let roughElement;
  const elementColor = color || "#000000";

  switch (toolType) {
    case toolTypes.RECTANGLE:
      roughElement = generateRectangle({ x1, y1, x2, y2, color });
      return {
        id: id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        color: elementColor,
      };
    case toolTypes.LINE:
      roughElement = generateLine({ x1, x2, y1, y2, color });
      return {
        id: id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        color: elementColor,
      };

    case toolTypes.TRIANGLE:
      roughElement = generateTriangle({ x1, y1, x2, y2, color });
      return {
        id: id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        color,
      };

    case toolTypes.CIRCLE:
      roughElement = generateCircle({ x1, y1, x2, y2, color });
      return {
        id: id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        color: elementColor,
      };
    case toolTypes.PENCIL:
      return {
        id,
        type: toolType,
        points: [{ x: x1, y: y1 }],
        color: elementColor,
      };
    case toolTypes.IMAGE:
      const img = new Image();
      img.src = src;
      const element = { id, type: toolType, img, src, x1, y1, x2, y2 };
      emitElementUpdate(element, roomID);
      return element;
    case toolTypes.TEXT:
      return {
        id,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
        text: text || "",
        color: elementColor,
      };
    default:
      throw new Error("Something went wrong when creating element");
  }
};
