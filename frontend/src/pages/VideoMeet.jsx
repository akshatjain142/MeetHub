import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/videoComponent.module.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import io from "socket.io-client";
import IconButton from "@mui/material/IconButton";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import Badge from "@mui/material/Badge";

const server_url = "http://localhost:8000";

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();

  const localVideoRef = useRef();
  const videoRef = useRef([]);

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);

  const [video, setVideo] = useState(false);
  const [audio, setAudio] = useState(false);
  const [screen, setScreen] = useState(false);
  const [showModal, setModal] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState(false);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessage, setNewMessage] = useState(0);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");

  const [videos, setVideos] = useState([]);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  const getUserMediaSuccess = (stream) => {
    const oldStream = window.localStream;

    window.localStream = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    for (let id in connections) {
      const peer = connections[id];

      if (!peer) continue;

      const senders = peer.getSenders();

      stream.getTracks().forEach((track) => {
        const sender = senders.find(
          (s) => s.track && s.track.kind === track.kind,
        );

        if (sender) {
          sender
            .replaceTrack(track)
            .catch((err) => console.log("replaceTrack error:", err));
        }
      });
    }

    if (oldStream) {
      oldStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (err) {
          console.log(err);
        }
      });
    }

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setVideo(false);
        setAudio(false);

        const blackSilence = (...args) =>
          new MediaStream([black(...args), silence()]);

        const fallbackStream = blackSilence();

        window.localStream = fallbackStream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = fallbackStream;
        }

        for (let id in connections) {
          const peer = connections[id];

          if (!peer) continue;

          const senders = peer.getSenders();

          fallbackStream.getTracks().forEach((track) => {
            const sender = senders.find(
              (s) => s.track && s.track.kind === track.kind,
            );

            if (sender) {
              sender
                .replaceTrack(track)
                .catch((err) =>
                  console.log("fallback replaceTrack error:", err),
                );
            }
          });
        }
      };
    });
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();

    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();

    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });

    canvas.getContext("2d").fillRect(0, 0, width, height);

    let stream = canvas.captureStream();

    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e));
      // } else {
      //   try {
      //     let tracks = localVideoRef.current.srcObject.getTracks();
      //     tracks.forEach((track) => track.stop());
      //   } catch (e) {}
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        }),
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  const addMessage = (data,sender,socketIdSender) => {

    setMessages((prevMessages)=>[
      ...prevMessages,
      {sender:sender,data:data}
    ]);

    if(socketIdSender!==socketIdRef.current){
      setNewMessage((prevMessages)=>prevMessages+1);
    }
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, {
      secure: false,
    });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      console.log("Connected:", socketRef.current.id);

      socketRef.current.emit("join-call", window.location.href);

      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        console.log("USER LEFT:", id);

        setVideos((videos) => videos.filter((video) => video.socketId !== id));

        if (connections[id]) {
          connections[id].close();
          delete connections[id];
        }
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          if (!connections[socketListId]) {
            connections[socketListId] = new RTCPeerConnection(
              peerConfigConnections,
            );

            connections[socketListId].onicecandidate = (event) => {
              if (event.candidate) {
                socketRef.current.emit(
                  "signal",
                  socketListId,
                  JSON.stringify({
                    ice: event.candidate,
                  }),
                );
              }
            };

            connections[socketListId].onaddstream = (event) => {
              let videoExists = videoRef.current.find(
                (video) => video.socketId === socketListId,
              );

              if (videoExists) {
                setVideos((videos) =>
                  videos.map((video) =>
                    video.socketId === socketListId
                      ? { ...video, stream: event.stream }
                      : video,
                  ),
                );
              } else {
                let newVideo = {
                  socketId: socketListId,
                  stream: event.stream,
                  autoplay: true,
                  playsinline: true,
                };

                setVideos((videos) => [...videos, newVideo]);
              }
            };

            if (window.localStream) {
              connections[socketListId].addStream(window.localStream);
            } else {
              const blackSilence = (...args) =>
                new MediaStream([black(...args), silence()]);

              window.localStream = blackSilence();

              connections[socketListId].addStream(window.localStream);
            }
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            console.log(
              "Offer to:",
              id2,
              "Senders:",
              connections[id2].getSenders().length,
            );

            connections[id2]
              .createOffer()
              .then((description) =>
                connections[id2].setLocalDescription(description),
              )
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id2,
                  JSON.stringify({
                    sdp: connections[id2].localDescription,
                  }),
                );
              })
              .catch((e) => console.log(e));
          }
        }
      });
    });
  };

  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);

    connectToSocketServer();
  };

  const connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  let routeTo=useNavigate();

  let handleVideo = () => {
    const newVideoState = !video;

    setVideo(newVideoState);

    if (window.localStream) {
      const videoTrack = window.localStream.getVideoTracks()[0];

      if (videoTrack) {
        videoTrack.enabled = newVideoState;
      }
    }
  };

  let handleAudio = () => {
    const newAudioState = !audio;
    setAudio(newAudioState);

    if (window.localStream) {
      const audioTrack = window.localStream.getAudioTracks()[0];

      if (audioTrack) {
        audioTrack.enabled = newAudioState;
      }
    }
  };
  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      const peer = connections[id];

      if (!peer) continue;

      const senders = peer.getSenders();

      stream.getTracks().forEach((track) => {
        const sender = senders.find(
          (s) => s.track && s.track.kind === track.kind,
        );

        if (sender) {
          sender
            .replaceTrack(track)
            .catch((err) =>
              console.log("Screen share replaceTrack error:", err),
            );
        }
      });
    }

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setScreen(false);

        const blackSilence = (...args) =>
          new MediaStream([black(...args), silence()]);

        const fallbackStream = blackSilence();

        window.localStream = fallbackStream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = fallbackStream;
        }

        getUserMedia();
      };
    });
  };

  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    }
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  let handleScreen = () => {
    setScreen(!screen);
  };

  let sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  let handleEndCall=()=>{
    try{
      let tracks=localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track=>track.stop());
    }
    catch(e) {console.log(e)};

    routeTo("/home");
  }

  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2>Enter into Lobby</h2>

          <TextField
            id="outlined-basic"
            label="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />

          <Button variant="contained" onClick={connect}>
            Connect
          </Button>

          <div>
            <video ref={localVideoRef} autoPlay muted></video>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Chat</h1>

                <div className={styles.chattingDisplay}>

                  {messages.length > 0?messages.map((item,index)=>{
                    return (
                      <div key={index} style={{marginBottom:"20px"}}>
                        <p style={{fontWeight:"bold"}}>{item.sender}</p>
                        <p>{item.data}</p>
                      </div>
                    )
                  }):<p>No Messages Yet</p>}

                </div>
                <div className={styles.chattingArea}>
                  <TextField
                    id="outlined-basic"
                    label="Enter your chat"
                    variant="outlined"
                    value={message}
                    onChange={e=>setMessage(e.target.value)}
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className={styles.buttonContainer}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>

            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : (
              <></>
            )}

            <Badge badgeContent={newMessage} max={999} color="secondary">
              <IconButton
                onClick={() => setModal(!showModal)}
                style={{ color: "white" }}
              >
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          {video && (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={styles.meetUserVideo}
            />
          )}
          <div className={styles.conferenceView}>
            {videos.map((video) => (
              <div key={video.socketId}>
                <video
                  data-socket={video.socketId}
                  autoPlay
                  playsInline
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
