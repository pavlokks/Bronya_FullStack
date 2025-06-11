import { FormControl } from '@chakra-ui/form-control';
import { Input } from '@chakra-ui/input';
import { Box, Text } from '@chakra-ui/layout';
import '../../assets/styles/chat.css';
import { IconButton, Spinner, useToast } from '@chakra-ui/react';
import { getSender, getSenderFull } from './config/ChatLogics';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { ArrowBackIcon } from '@chakra-ui/icons';
import ProfileModal from './miscellaneous/ProfileModal';
import ScrollableChat from './ScrollableChat';
import io from 'socket.io-client';
import Lottie from 'lottie-react';
import animationData from '../../assets/data/typing.json';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext.jsx';
import { url } from '../../utils/Constants';

const ENDPOINT = 'http://localhost:5000';
let socket;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const toast = useToast();

  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    useContext(UserContext);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  // Ініціалізація WebSocket
  useEffect(() => {
    if (!user?._id) {
      console.error('User not loaded for WebSocket setup');
      return;
    }

    socket = io(ENDPOINT, { transports: ['websocket'], reconnection: true });
    socket.emit('setup', user);
    socket.on('connect', () => {
      console.log('WebSocket connected:', user._id);
      setSocketConnected(true);
    });
    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setSocketConnected(false);
    });
    socket.on('typing', (chatId) => {
      if (chatId && chatId === selectedChat?._id) {
        setIsTyping(true);
      }
    });
    socket.on('stop typing', (chatId) => {
      if (chatId && chatId === selectedChat?._id) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.disconnect();
      console.log('WebSocket cleanup');
    };
  }, [user, selectedChat]);

  // Отримання повідомлень чату
  const fetchMessages = useCallback(async () => {
    if (!selectedChat?._id) {
      console.log('No chat selected, skipping fetchMessages');
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem('token'),
        },
      };

      setLoading(true);
      const { data } = await axios.get(`${url}/chats/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      if (socketConnected) {
        socket.emit('join chat', selectedChat._id);
      }
    } catch (error) {
      toast({
        title: 'Помилка!',
        description: 'Не вдалося завантажити повідомлення',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
    }
  }, [selectedChat, toast, socketConnected]);

  // Відправлення повідомлення
  const sendMessage = useCallback(
    async (event) => {
      if (event.key !== 'Enter' || !newMessage || !selectedChat?._id) return;

      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            token: localStorage.getItem('token'),
          },
        };
        const messageData = {
          content: newMessage,
          chatId: selectedChat._id,
        };
        setNewMessage('');
        if (socketConnected && selectedChat._id) {
          socket.emit('stop typing', selectedChat._id);
        }

        const { data } = await axios.post(`${url}/chats/message`, messageData, config);
        socket.emit('new message', data);
        setMessages((prev) => [...prev, data]);
      } catch (error) {
        toast({
          title: 'Помилка!',
          description: 'Не вдалося відправити повідомлення',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom',
        });
      }
    },
    [newMessage, selectedChat, toast, socketConnected],
  );

  // Обробка введення тексту
  const typingHandler = useCallback(
    (e) => {
      setNewMessage(e.target.value);

      if (!socketConnected || !selectedChat?._id) {
        return;
      }

      if (!typing) {
        setTyping(true);
        socket.emit('typing', selectedChat._id);
      }
      let lastTypingTime = new Date().getTime();
      let timerLength = 3000;
      setTimeout(() => {
        let timeNow = new Date().getTime();
        let timeDiff = timeNow - lastTypingTime;
        if (timeDiff >= timerLength && typing) {
          socket.emit('stop typing', selectedChat._id);
          setTyping(false);
        }
      }, timerLength);
    },
    [socketConnected, typing, selectedChat],
  );

  // Завантаження повідомлень при зміні чату
  useEffect(() => {
    fetchMessages();
  }, [selectedChat, fetchMessages]);

  // Обробка отриманих повідомлень через WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (newMessageReceived) => {
      if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prev) => [...prev, newMessageReceived]);
      }
    };

    socket.on('message recieved', handleMessageReceived);

    return () => {
      socket.off('message recieved', handleMessageReceived);
    };
  }, [selectedChat, notification, fetchAgain, setFetchAgain, setNotification]);

  if (!user?._id) {
    return <div>Користувач недоступний</div>;
  }

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: '28px', md: '30px' }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Victor Mono"
            display="flex"
            justifyContent={{ base: 'space-between' }}
            alignItems="center"
          >
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat('')}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>{selectedChat.chatName.toUpperCase()}</>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl onKeyDown={sendMessage} id="first-name" isRequired mt={3}>
              {isTyping ? (
                <div className="typing-indicator">
                  <Lottie
                    {...defaultOptions}
                    style={{ marginBottom: 5, marginLeft: 0, width: 40, height: 20 }}
                  />
                  <Text fontSize="sm" ml={2} color="gray.500">
                    Печатає...
                  </Text>
                </div>
              ) : (
                <></>
              )}
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Напишіть щось..."
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Victor Mono">
            Натисніть на користувача, щоб розпочати чат
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
