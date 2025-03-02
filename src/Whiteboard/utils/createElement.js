import rough from "roughjs/bundled/rough.esm";
import { toolTypes } from "../../constants";
import { emitElementUpdate } from "../../socketConn/socketConn";

const generator = rough.generator();

const generateRectangle = ({ x1, y1, x2, y2 }) => {
  return generator.rectangle(x1, y1, x2 - x1, y2 - y1, {
    fill: 'red',
    hachureAngle: 60, // angle of hachure,
    hachureGap: 8
  });
};

const generateLine = ({ x1, y1, x2, y2 }) => {
  return generator.line(x1, y1, x2, y2);
};

export const createElement = ({ x1, y1, x2, y2, toolType, id, text, src, roomID }) => {
  let roughElement;

  switch (toolType) {
    case toolTypes.RECTANGLE:
      roughElement = generateRectangle({ x1, y1, x2, y2 });
      return {
        id: id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
      };
    case toolTypes.LINE:
      roughElement = generateLine({ x1, x2, y1, y2 });
      return {
        id: id,
        roughElement,
        type: toolType,
        x1,
        y1,
        x2,
        y2,
      };
    case toolTypes.PENCIL:
      return {
        id,
        type: toolType,
        points: [{ x: x1, y: y1 }],
      };

    case toolTypes.IMAGE:

      const img = new Image();
      img.src = src;
      const element = { id, type: toolType, img, src, x1, y1, x2, y2 }
      emitElementUpdate(element, roomID)

      return { id, type: toolType, img, src, x1, y1, x2, y2 }; // Temporary element

    case toolTypes.TEXT:
      return { id, type: toolType, x1, y1, x2, y2, text: text || "" };
    default:
      throw new Error("Something went wrong when creating element");
  }
};
