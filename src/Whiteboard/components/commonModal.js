// CommonModals.js
import React from "react";
import { v4 as uuid } from "uuid";

const CommonModals = ({
  openImageModel,
  setOpenImageModel,
  imageUrl,
  setImageUrl,
  mousePosition,
  createElement,
  toolTypes,
  setSelectedElement,
  updateElementInStore,
  dispatch,
}) => {
  return (
    <>
      {/* Image Upload Modal */}
      {openImageModel && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#333",
              borderRadius: "12px",
              padding: "25px",
              width: "400px",
              maxWidth: "90%",
              boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                color: "#fff",
                textAlign: "center",
                marginTop: 0,
                marginBottom: "20px",
                fontSize: "20px",
              }}
            >
              Add Image
            </h3>

            <input
              type="text"
              placeholder="Enter image URL"
              value={imageUrl || ""}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 15px",
                marginBottom: "20px",
                fontSize: "14px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#444",
                color: "#fff",
                outline: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <button
                onClick={(e) => {
                  if (imageUrl) {
                    const element = createElement({
                      x1: mousePosition.x,
                      y1: mousePosition.y,
                      x2: mousePosition.x + 600,
                      y2: mousePosition.y + 600,
                      toolType: toolTypes.IMAGE,
                      id: uuid(),
                      src: imageUrl,
                    });

                    setSelectedElement(element);
                    dispatch(updateElementInStore(element));
                  }
                  setOpenImageModel(false);
                  setImageUrl("");
                }}
                style={{
                  padding: "10px 20px",
                  minWidth: "100px",
                  backgroundColor: imageUrl ? "#36408a" : "#555",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  marginRight: "10px",
                  cursor: imageUrl ? "pointer" : "not-allowed",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (imageUrl) {
                    e.currentTarget.style.backgroundColor = "#141c59";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (imageUrl) {
                    e.currentTarget.style.backgroundColor = "#36408a";
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
              >
                Add
              </button>
              <button
                onClick={() => setOpenImageModel(false)}
                style={{
                  padding: "10px 20px",
                  minWidth: "100px",
                  backgroundColor: "#E91E63",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#C2185B";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#E91E63";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommonModals;
