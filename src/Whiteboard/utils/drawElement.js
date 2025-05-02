import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from ".";
import { toolTypes } from "../../constants";

const drawPencilElement = (context, element) => {
  // Save the current context state
  context.save();

  // Make sure we have a valid color
  const elementColor = element.color || '#000000';

  // Set the stroke and fill styles
  context.strokeStyle = elementColor;
  context.fillStyle = elementColor;

  const myStroke = getStroke(element.points, {
    size: 3,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  });

  const pathData = getSvgPathFromStroke(myStroke);

  const myPath = new Path2D(pathData);
  context.fill(myPath);

  // Restore the context state
  context.restore();
};

const drawTextElement = (context, element, wordsPerLine = 15) => {
  // Save the current context state
  context.save();

  // Make sure we have a valid color
  const textColor = element.color || '#000000';

  // Set text rendering properties
  context.textBaseline = "top";
  context.font = "15px sans-serif";
  context.fillStyle = textColor;

  // Split text into words and lines
  const words = element.text ? element.text.split(" ") : [];
  const lines = [];

  // Create lines with a maximum of 'wordsPerLine' words per line
  for (let i = 0; i < words.length; i += wordsPerLine) {
    let line = words.slice(i, i + wordsPerLine).join(" ");
    lines.push(line);
  }

  // Render each line
  const lineHeight = 16;
  lines.forEach((line, index) => {
    context.fillText(line, element.x1, element.y1 + index * lineHeight);
  });

  // Restore the context state
  context.restore();
};


const drawImageElement = (context, element) => {
  const img = new Image()
  img.src = element.src
  context.drawImage(img, element.x1, element.y1, img.naturalWidth / 6, img.naturalHeight / 6);
}

export const drawElement = ({ roughCanvas, context, element }) => {
  switch (element.type) {
    case toolTypes.RECTANGLE:
    case toolTypes.LINE:
    case toolTypes.CIRCLE:
      case toolTypes.TRIANGLE: // Add this case
      return roughCanvas.draw(element.roughElement);
    case toolTypes.PENCIL:
      drawPencilElement(context, element);
      break;
    case toolTypes.TEXT:
      drawTextElement(context, element);
      break;
    case toolTypes.IMAGE:
      drawImageElement(context, element)
      break;
    default:
      throw new Error("Something went wrong when drawing element");
  }
};
