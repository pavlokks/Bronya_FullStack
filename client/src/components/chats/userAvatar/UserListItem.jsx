import { Avatar } from '@chakra-ui/avatar';
import { Box, Text } from '@chakra-ui/layout';

const UserListItem = ({ user, handleFunction }) => {
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{
        background: '#4CAF50',
        color: 'white',
      }}
      w="100%"
      display="flex"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
    >
      <Avatar mr={2} size="sm" cursor="pointer" name={user.username} src={user.pic} />
      <Box>
        <Text>{user.username}</Text>
        <Text fontSize="xs">
          <b>Емейл: </b>
          {user.email}
        </Text>
        <Text fontSize="xs">
          <b>Номер: </b>
          {user.phone || 'Відсутній'}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;
