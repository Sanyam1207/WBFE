'use client'
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toolTypes } from "../constants";
import ImageIcon from '../resources/icons/ImageIcon.svg';
import lineIcon from "../resources/icons/line.svg";
import pencilIcon from "../resources/icons/pencil.svg";
import rectangleIcon from "../resources/icons/rectangle.svg";
import rubberIcon from "../resources/icons/rubber.svg";
import selectionIcon from "../resources/icons/selection.svg";
import textIcon from "../resources/icons/text.svg";
import { emitClearWhiteboard } from "../socketConn/socketConn";
import { setElements, setToolType } from "./whiteboardSlice";
import ColorPicker from "./utils/ColorPicker";

const IconButton = ({ src, type, roomID, label, icon }) => {
  const dispatch = useDispatch();
  const selectedToolType = useSelector((state) => state.whiteboard.tool);

  const handleToolChange = () => {
    dispatch(setToolType(type));
  };

  const isActive = selectedToolType === type;

  return (
    <div className="tool-button-container">
      <button
        onClick={handleToolChange}
        className={isActive ? "menu_button_active" : "menu_button"}
        title={`Select ${label} tool`}
        style={{
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {icon ? (
          <div style={{ fontSize: '20px' }}>{icon}</div>
        ) : (
          <img 
            alt={label} 
            width="24px" 
            height="24px" 
            src={src} 
            style={{ 
              filter: isActive ? 'brightness(0) invert(1)' : 'none',
              transition: 'all 0.3s ease'
            }} 
          />
        )}
        {isActive && (
          <div 
            style={{
              position: 'absolute',
              bottom: '-2px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '30px',
              height: '3px',
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              borderRadius: '2px',
              animation: 'slideIn 0.3s ease-out'
            }}
          />
        )}
      </button>
      <span className="tool-label">{label}</span>
    </div>
  );
};

const Menu = ({ roomID, onAISearchOpen }) => {
  // SATYAM: Moved toolbar into a top header layout and consolidated tool controls here.
  // Why: Improve UX by showing all tools in a single top toolbar (upload, color, clear, slides).
  // What: This component now renders a fixed `.top-toolbar` header with tool icons, upload
  // buttons and a clear-all action. The previous sidebar layout was replaced for clarity.
  const [showColorPicker, setShowColorPicker] = useState(false);
  // Local slide state (placeholder). If slides are managed elsewhere, wire these to Redux or parent props.
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides] = useState(1);
  const dispatch = useDispatch();

  const handleColorPickerToggle = () => {
    setShowColorPicker(!showColorPicker);
  };

  const handleColorPickerClose = () => {
    setShowColorPicker(false);
  };

  const handleClearAll = () => {
    const confirmClear = window.confirm(
      "🗑️ Are you sure you want to clear the entire whiteboard? This action cannot be undone."
    );
    
    if (confirmClear) {
      dispatch(setElements([]));
      emitClearWhiteboard(roomID);
      
      // Show a brief success message
      const notification = document.createElement('div');
      notification.textContent = '✨ Whiteboard cleared successfully!';
      notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        animation: bounce 0.6s ease-out;
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    }
  };

  const prevSlide = () => {
    setCurrentSlide((s) => Math.max(1, s - 1));
    // TODO: emit slide change over socket or call parent handler
  };

  const nextSlide = () => {
    setCurrentSlide((s) => Math.min(totalSlides, s + 1));
    // TODO: emit slide change over socket or call parent handler
  };

  const handlePdfUpload = () => {
    // Create and trigger file input click
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.txt';
    fileInput.style.display = 'none';
    
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Show uploading notification
      const notification = document.createElement('div');
      notification.textContent = '📄 Uploading file...';
      notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        animation: bounce 0.6s ease-out;
      `;
      document.body.appendChild(notification);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (evt) => {
        // Emit file to other users
        // You might need to import emitFile from socketConn
        // emitFile({
        //   roomID,
        //   fileName: file.name,
        //   fileType: file.type,
        //   fileData: evt.target.result,
        // });

        // Update notification
        notification.textContent = '✨ File uploaded successfully!';
        notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 2000);
      };
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  const tools = [
    { 
      src: selectionIcon, 
      type: toolTypes.SELECTION, 
      roomID,
      label: "Select",
      icon: "🎯"
    },
    { 
      src: lineIcon, 
      type: toolTypes.LINE, 
      roomID,
      label: "Line",
      icon: "📏"
    },
    { 
      src: rectangleIcon, 
      type: toolTypes.RECTANGLE, 
      roomID,
      label: "Rectangle",
      icon: "⬜"
    },
    { 
      src: pencilIcon, 
      type: toolTypes.PENCIL, 
      roomID,
      label: "Pencil",
      icon: "✏️"
    },
    { 
      src: textIcon, 
      type: toolTypes.TEXT, 
      roomID,
      label: "Text",
      icon: "📝"
    },
    { 
      src: ImageIcon, 
      type: toolTypes.IMAGE, 
      roomID,
      label: "Image",
      icon: "🖼️"
    },
    { 
      src: 'https://i.pinimg.com/736x/cb/0c/e8/cb0ce84c89ea556e5540e436958b797e.jpg', 
      type: toolTypes.TRIANGLE, 
      roomID,
      label: "Triangle",
      icon: "🔺"
    },
    { 
      src: 'https://i.pinimg.com/736x/cb/0c/e8/cb0ce84c89ea556e5540e436958b797e.jpg', 
      type: toolTypes.CIRCLE, 
      roomID,
      label: "Circle",
      icon: "⭕"
    },
    { 
      src: rubberIcon, 
      type: toolTypes.RUBBER, 
      roomID,
      label: "Eraser",
      icon: "🧹"
    }
  ];

  return (
    <>
      <header className="top-toolbar">
        <div className="toolbar-left">
          <div className="tool-icons">
            {tools.map((tool, index) => (
              <IconButton
                key={index}
                src={tool.src}
                type={tool.type}
                roomID={tool.roomID}
                label={tool.label}
                icon={tool.icon}
              />
            ))}
          </div>
        </div>

        <div className="toolbar-center">
          <div className="toolbar-title">TOOLBAR</div>
        </div>

        <div className="toolbar-right">
          <button className="upload-doc" onClick={handlePdfUpload} title="Upload Document">📄 Upload Doc</button>
          <button
            className="upload-doc ai-chat-button"
            onClick={onAISearchOpen}
            title="Open AI Chat"
            style={{ marginLeft: '8px', background: 'linear-gradient(135deg,#06b6d4,#0ea5e9)' }}
          >
            🤖 AI Chat
          </button>
          <button
            className="upload-doc"
            onClick={handleColorPickerToggle}
            title="Color & Style"
            style={{ background: 'linear-gradient(135deg,#f97316,#f59e0b)' }}
          >
            🎨 Color
          </button>
          <button
            className="clear-all-button"
            onClick={handleClearAll}
            title="Clear entire whiteboard"
            style={{ marginLeft: '12px' }}
          >
            🗑️ Clear
          </button>
          <div className="slide-controls">
            <button className="slide-btn" onClick={prevSlide}>◀</button>
            <div className="slide-label">{currentSlide} / {totalSlides}</div>
            <button className="slide-btn" onClick={nextSlide}>▶</button>
          </div>
        </div>
      </header>

      {showColorPicker && (
        <div className="color-picker-overlay" onClick={handleColorPickerClose}>
          <div className="color-picker-container" onClick={(e) => e.stopPropagation()}>
            <div className="color-picker-header">
              <h4>🎨 Choose Color & Style</h4>
              <button 
                className="close-button"
                onClick={handleColorPickerClose}
              >
                ✕
              </button>
            </div>
            <ColorPicker />
          </div>
        </div>
      )}
    </>
  );
};

export default Menu;
