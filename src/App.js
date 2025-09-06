import React, { useEffect } from "react";
import CursorOverlay from "./Whiteboard/CursorOverlay";
import { connectWithSocketServer } from "./socketConn/socketConn";
import Whiteboard from "./Whiteboard/components/Whiteboard";

function App() {
  useEffect(() => {
    connectWithSocketServer();
  }, []);

  return (
    <div>
      <Whiteboard />
      <CursorOverlay />
    </div>
  );
}

export default App;
