import { useCallback } from "react";

const useChatHandler = ({
  input,
  userID,
  messages,
  store,
  setMessages,
  emitMessages,
  roomID,
}) => {
  const handleSendChat = useCallback(() => {
    const dataToSend = { message: input, userID: userID };
    const messageCopy = [...messages, dataToSend];

    store.dispatch(setMessages(messageCopy));
    emitMessages({ userID, message: input, roomID, messageCopy });
  }, [input, userID, messages, store, setMessages, emitMessages, roomID]);

  return handleSendChat;
};

export default useChatHandler;
