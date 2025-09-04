// useWhatsAppSocket.js
import { useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client";

export function useWhatsAppSocket({ serverUrl, whatsappbot_id, uid, extraQuery, onMessage }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingBy, setTypingBy] = useState(null);
  const [messages, setMessages] = useState([]);

  const messageKeysRef = useRef(new Set());
  const roomPayload = useMemo(() => ({ whatsappbot_id, uid }), [whatsappbot_id, uid]);
  const roomKey = `${whatsappbot_id ?? ""}:${uid ?? ""}`;

  // connect once per serverUrl
  useEffect(() => {
    const s = io(serverUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      timeout: 20000,
      query: extraQuery,
    });

    setSocket(s);

    const onConnect = () => {
      setConnected(true);
      if (whatsappbot_id && uid) s.emit("join", roomPayload);
    };
    const onDisconnect = () => setConnected(false);
    const onConnectError = (err) => console.log("⚠️ connect_error:", err?.message ?? err);

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("connect_error", onConnectError);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("connect_error", onConnectError);
      if (s.__chatNewHandler) s.off("chat:new", s.__chatNewHandler);
      if (s.__typingHandler) s.off("typing", s.__typingHandler);
      if (s.__joinedHandler) s.off("joined", s.__joinedHandler);
      s.disconnect();
    };
  }, [serverUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // room switch + listeners
  useEffect(() => {
    if (!socket) return;

    const hasRoom = Boolean(whatsappbot_id && uid);
    const newRoom = roomKey;
    const prevRoom = socket.__currentRoom;

    if (prevRoom && prevRoom !== newRoom) {
      const [prevBot, prevUid] = prevRoom.split(":");
      socket.emit("leave", { whatsappbot_id: prevBot, uid: prevUid });
      messageKeysRef.current = new Set();
      setMessages([]);
    }

    socket.__currentRoom = newRoom;
    if (socket.connected && hasRoom) socket.emit("join", roomPayload);

    // joined
    if (socket.__joinedHandler) socket.off("joined", socket.__joinedHandler);
    socket.__joinedHandler = () => { };
    socket.on("joined", socket.__joinedHandler);

    // typing
    if (socket.__typingHandler) socket.off("typing", socket.__typingHandler);
    socket.__typingHandler = (data) => {
      if (data?.whatsappbot_id !== whatsappbot_id || data?.uid !== uid) return;
      setIsTyping(true);
      setTypingBy(data?.by ?? null);
      setTimeout(() => {
        setIsTyping(false);
        setTypingBy(null);
      }, 3000);
    };
    socket.on("typing", socket.__typingHandler);

    // chat:new
    if (socket.__chatNewHandler) socket.off("chat:new", socket.__chatNewHandler);
    socket.__chatNewHandler = (payload) => {
      const arr = Array.isArray(payload) ? payload : [payload];

      // only accept messages for THIS room
      const filtered = arr.filter(
        (m) =>
          (m?.whatsappbot_id ?? m?.bot_id) === whatsappbot_id &&
          (m?.uid ?? m?.chat_uid) === uid
      );
      if (!filtered.length) return;

      const normalized = filtered.map((m) => ({
        id: m.id ?? m.message_id ?? m.sid ?? undefined,
        text: m.message ?? m.text ?? "",
        sender:
          m.is_incoming_message === 1 || m.direction === "inbound"
            ? "received"
            : "user",
        status: m.status ?? "received",
        createdAt: new Date(m.created_at ?? m.timestamp ?? Date.now()),
        timestamp: m.timestamp,
        isAI: false,
      }));

      const toAppend = [];
      for (const n of normalized) {
        const k =
          n.id != null
            ? `id:${n.id}`
            : `k:${n.createdAt?.toISOString?.() ?? ""}_${n.text ?? ""}`;
        if (!messageKeysRef.current.has(k)) {
          messageKeysRef.current.add(k);
          toAppend.push(n);
        }
      }
      if (!toAppend.length) return;

      // push to internal buffer (optional)
      setMessages((prev) =>
        prev.concat(toAppend).sort(
          (a, b) =>
            new Date(a?.createdAt ?? 0).getTime() -
            new Date(b?.createdAt ?? 0).getTime()
        )
      );

      // notify screen (preferred path)
      try {
        toAppend.forEach((n) => onMessage?.(n, { whatsappbot_id, uid }));
      } catch (e) {
        console.log("onMessage handler error:", e);
      }
    };
    socket.on("chat:new", socket.__chatNewHandler);

    return () => {
      if (socket.__joinedHandler) socket.off("joined", socket.__joinedHandler);
      if (socket.__typingHandler) socket.off("typing", socket.__typingHandler);
      if (socket.__chatNewHandler) socket.off("chat:new", socket.__chatNewHandler);
    };
  }, [socket, roomKey, whatsappbot_id, uid, roomPayload, onMessage]);

  const sendTyping = () => socket?.emit("typing", { ...roomPayload, by: "client" });
  const leaveRoom = () => socket?.emit("leave", roomPayload);

  return { socket, connected, messages, isTyping, typingBy, sendTyping, leaveRoom, setMessages };
}
