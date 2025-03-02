import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// Helper function to convert a Data URL to a Blob
function dataURLtoBlob(dataurl) {
  const commaIndex = dataurl.indexOf(",");
  if (commaIndex === -1) {
    throw new Error("Invalid data URL format: no comma found.");
  }
  const header = dataurl.substring(0, commaIndex);
  let base64Data = dataurl.substring(commaIndex + 1);
  if (!base64Data) {
    throw new Error("Base64 data is empty.");
  }
  base64Data = base64Data.trim().replace(/\s/g, "");
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "application/pdf";
  const byteString = atob(base64Data);
  const byteNumbers = new Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    byteNumbers[i] = byteString.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
}

const PdfViewer = () => {
  const dataUrl = useSelector((state) => state.file.url); // Redux variable holding the URL
  const [pdfURL, setPdfURL] = useState(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    if (dataUrl) {
      let blobUrl;
      // If the URL starts with "data:", convert it; if it's already a blob URL, use it as is.
      if (dataUrl.startsWith("data:")) {
        try {
          const blob = dataURLtoBlob(dataUrl);
          blobUrl = URL.createObjectURL(blob);
        } catch (error) {
          console.error("Failed to convert data URL to Blob:", error);
          return;
        }
      } else if (dataUrl.startsWith("blob:")) {
        blobUrl = dataUrl;
      } else {
        console.error("Unknown URL format");
        return;
      }

      setPdfURL(blobUrl);
      return () => {
        // Only revoke if we created the blob URL from a data URL.
        if (dataUrl.startsWith("data:") && blobUrl) {
          URL.revokeObjectURL(blobUrl);
        }
      };
    }
  }, [dataUrl]);

  return (
    <div>
      {pdfURL ? (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
          <div style={{ height: "90vh", backgroundColor: "black", position: "relative", width: "45vw", zIndex: 100, overflow: "visible" }}>
            <Viewer fileUrl={pdfURL} plugins={[defaultLayoutPluginInstance]} />
          </div>
        </Worker>
      ) : (
        <p>No PDF to display</p>
      )}
    </div>
  );
};

export default PdfViewer;
