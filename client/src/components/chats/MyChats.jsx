import { Box, Stack, Text } from '@chakra-ui/layout';
import { useToast } from '@chakra-ui/toast';
import axios from 'axios';
import { useContext, useEffect, useState, useCallback } from 'react';
import { getSender } from './config/ChatLogics';
import ChatLoading from './ChatLoading';
import { Button } from '@chakra-ui/react';
import { UserContext } from '../../context/UserContext.jsx';
import { url } from '../../utils/Constants';
import { useDisclosure } from '@chakra-ui/hooks';
import { Input } from '@chakra-ui/input';
import UserListItem from './userAvatar/UserListItem';
import { Spinner } from '@chakra-ui/spinner';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay } from '@chakra-ui/modal';
import { Tooltip } from '@chakra-ui/tooltip';
import debounce from 'lodash/debounce';

const MyChats = ({ fetchAgain }) => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    loggedUser,
    setLoggedUser,
    selectedChat,
    setSelectedChat,
    searchResult,
    setSearchResult,
    chats,
    setChats,
  } = useContext(UserContext);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Отримання списку чатів із затримкою
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchChats = useCallback(
    debounce(async () => {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            token: localStorage.getItem('token'),
          },
        };

        const { data } = await axios.get(`${url}/chats`, config);
        setChats(data);
      } catch (error) {
        toast({
          title: 'Помилка!',
          description: 'Не вдалося завантажити чати',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom-left',
        });
      }
    }, 500),
    [setChats, toast],
  );

  // Пошук користувачів
  const handleSearch = async () => {
    if (!search) {
      toast({
        title: 'Введіть дані для пошуку',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-left',
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem('token'),
        },
      };

      const { data } = await axios.get(`${url}/chats/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: 'Помилка!',
        description: 'Не вдалося завантажити результати пошуку',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left',
      });
    }
  };

  // Доступ до чату з користувачем
  const accessChat = async (guestuserId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem('token'),
        },
      };
      const { data } = await axios.post(`${url}/chats`, { guestuserId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: 'Помилка!',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left',
      });
    }
  };

  // Ініціалізація користувача та чатів
  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem('userInfo')));
    fetchChats();
  }, [fetchAgain, fetchChats, setLoggedUser]);

  return (
    <>
      <Box
        display={{ base: selectedChat ? 'none' : 'flex', md: 'flex' }}
        flexDir="column"
        alignItems="center"
        p={3}
        bg="white"
        w={{ base: '100%', md: '31%' }}
        borderRadius="lg"
        borderWidth="1px"
      >
        <Box
          pb={3}
          px={3}
          fontSize={{ base: '28px', md: '30px' }}
          fontFamily="Victor Mono"
          display="flex"
          w="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          <Tooltip label="Пошук користувачів для чату" hasArrow placement="bottom-end">
            <Button variant="ghost" onClick={onOpen}>
              <i className="fas fa-search"></i>
              <Text display={{ base: 'none', md: 'flex' }} px={4}>
                Пошук користувача
              </Text>
            </Button>
          </Tooltip>
        </Box>

        <Box
          display="flex"
          flexDir="column"
          p={3}
          bg="#F8F8F8"
          w="100%"
          h="100%"
          borderRadius="lg"
          overflowY="hidden"
        >
          {chats ? (
            <Stack overflowY="scroll">
              {chats.map((chat) => (
                <Box
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  bg={selectedChat === chat ? '#4CAF50' : '#E8E8E8'}
                  color={selectedChat === chat ? 'white' : 'black'}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  key={chat._id}
                >
                  <Text>
                    {!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                  </Text>
                  {chat.latestMessage && (
                    <Text fontSize="xs">
                      <b>{chat.latestMessage.sender.username} : </b>
                      {chat.latestMessage.content.length > 50
                        ? chat.latestMessage.content.substring(0, 51) + '...'
                        : chat.latestMessage.content}
                    </Text>
                  )}
                </Box>
              ))}
            </Stack>
          ) : (
            <ChatLoading />
          )}
        </Box>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px" ml={0}>
            Пошук користувача
          </DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="За ім’ям/поштою"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Пошук</Button>
            </Box>

            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MyChats;
