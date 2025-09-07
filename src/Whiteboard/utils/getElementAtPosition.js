import { toolTypes, cursorPositions } from "../../constants";

const distance = (a, b) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const onLine = ({ x1, y1, x2, y2, x, y, maxDistance = 1 }) => {
  const a = { x: x1, y: y1 };
  const b = { x: x2, y: y2 };
  const c = { x, y };

  const offset = distance(a, b) - (distance(a, c) + distance(b, c));
  return Math.abs(offset) < maxDistance ? cursorPositions.INSIDE : null;
};

const nearPoint = (x, y, x1, y1, cursorPosition) => {
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? cursorPosition : null;
};

const positionWithinElement = (x, y, element) => {
  const { type, x1, x2, y1, y2 } = element;

  switch (type) {
    case toolTypes.IMAGE:
    case toolTypes.RECTANGLE:
      const topLeft = nearPoint(x, y, x1, y1, cursorPositions.TOP_LEFT);
      const topRight = nearPoint(x, y, x2, y1, cursorPositions.TOP_RIGHT);
      const bottomLeft = nearPoint(x, y, x1, y2, cursorPositions.BOTTOM_LEFT);
      const bottomRight = nearPoint(x, y, x2, y2, cursorPositions.BOTTOM_RIGHT);
      const inside =
        x >= x1 && x <= x2 && y >= y1 && y <= y2
          ? cursorPositions.INSIDE
          : null;
      return topLeft || topRight || bottomLeft || bottomRight || inside;
    case toolTypes.TEXT:
      return x >= x1 && x <= x2 && y >= y1 && y <= y2
        ? cursorPositions.INSIDE
        : null;
    case toolTypes.LINE:
      const on = onLine({ x1, y1, x2, y2, x, y });
      const start = nearPoint(x, y, x1, y1, cursorPositions.START);
      const end = nearPoint(x, y, x2, y2, cursorPositions.END);

      return start || end || on;
    case toolTypes.PENCIL:
      const betweenAnyPoint = element.points.some((point, index) => {
        const nextPoint = element.points[index + 1];
        if (!nextPoint) return false;

        return onLine({
          x1: point.x,
          y1: point.y,
          x2: nextPoint.x,
          y2: nextPoint.y,
          x,
          y,
          maxDistance: 5,
        });
      });

      return betweenAnyPoint ? cursorPositions.INSIDE : null;
    
    // SATYAM: Added support for CIRCLE and TRIANGLE shapes so eraser can detect and delete them
    // Why: Previously eraser couldn't detect these shapes because getElementAtPosition didn't handle them
    // What: CIRCLE uses bounding box detection, TRIANGLE checks if point is inside triangle area
    case toolTypes.CIRCLE:
      // For circles, use bounding box detection (simple approximation)
      const centerX = (x1 + x2) / 2;
      const centerY = (y1 + y2) / 2;
      const radiusX = Math.abs(x2 - x1) / 2;
      const radiusY = Math.abs(y2 - y1) / 2;
      
      // Check if point is inside ellipse bounds (rough approximation for hit detection)
      const normalizedX = (x - centerX) / radiusX;
      const normalizedY = (y - centerY) / radiusY;
      const isInsideCircle = (normalizedX * normalizedX + normalizedY * normalizedY) <= 1.2; // 1.2 for easier clicking
      
      return isInsideCircle ? cursorPositions.INSIDE : null;
      
    case toolTypes.TRIANGLE:
      // For triangles, check if point is inside triangle bounds (simplified bounding box check)
      const triangleInside = x >= Math.min(x1, x2) && x <= Math.max(x1, x2) && 
                           y >= Math.min(y1, y2) && y <= Math.max(y1, y2);
      return triangleInside ? cursorPositions.INSIDE : null;

    default : break;
  }
};

export const getElementAtPosition = (x, y, elements) => {
  return elements
    .map((el) => ({
      ...el,
      position: positionWithinElement(x, y, el),
    }))
    .find((el) => el.position !== null && el.position !== undefined);
};
