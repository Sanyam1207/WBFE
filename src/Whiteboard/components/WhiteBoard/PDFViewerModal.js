import React from "react";
import PdfViewer from "../../../components/PdfViewer";
import WebsiteShareControl from "../../../components/WebsiteShareControl";
import WebsiteDisplay from "../../../components/WebsiteDisplay";

const PDFViewerModal = ({ showPdf, onClose, roomID, userID }) => {
  if (!showPdf) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        width: "80%",
        height: "80%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        borderTopLeftRadius: "12px",
        boxShadow: "0 -5px 25px rgba(0,0,0,0.2)",
        overflow: "hidden",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 15px",
          backgroundColor: "#36408a",
          color: "#fff",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "16px" }}>
          Document Viewer
        </div>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "#fff",
            border: "none",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "10px 15px",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
          }}
        >
          <WebsiteShareControl
            roomID={roomID}
            userID={userID}
            isTeacher={true}
          />
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          <PdfViewer />
        </div>
      </div>
      <WebsiteDisplay roomID={roomID} userID={userID} />
    </div>
  );
};

export default PDFViewerModal;
