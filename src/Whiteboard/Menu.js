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

const IconButton = ({ src, type, isRubber, roomID }) => {
  const dispatch = useDispatch();

  const selectedToolType = useSelector((state) => state.whiteboard.tool);

  const handleToolChange = () => {
    dispatch(setToolType(type));
  };

  const handleClearCanvas = () => {
    dispatch(setElements([]));

    emitClearWhiteboard(roomID);
  };

  return (
    <button
      onClick={isRubber ? handleClearCanvas : handleToolChange}
      className={
        selectedToolType === type ? "menu_button_active" : "menu_button"
      }
    >
      <img alt='IDK' width="70%" height="70%" src={src} />
    </button>
  );
};

const Menu = ({ roomID }) => {
  // eslint-disable-next-line no-unused-vars
  const [AISearchOpen, setAISearchOpen] = useState(false)

  return (
    <div className="menu_container">
      <IconButton src={rectangleIcon} type={toolTypes.RECTANGLE} />
      <IconButton src={lineIcon} type={toolTypes.LINE} />
      <IconButton src={rubberIcon} isRubber roomID={roomID} />
      <IconButton src={pencilIcon} type={toolTypes.PENCIL} />
      <IconButton src={textIcon} type={toolTypes.TEXT} />
      <IconButton src={selectionIcon} type={toolTypes.SELECTION} />
      <IconButton src={ImageIcon} type={toolTypes.IMAGE} />
    </div>
  );
};

export default Menu;
