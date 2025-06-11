import { ViewIcon } from '@chakra-ui/icons';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Text,
  Image,
} from '@chakra-ui/react';

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton display={{ base: 'flex' }} icon={<ViewIcon />} onClick={onOpen} />
      )}
      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent h="460px">
          <ModalHeader
            fontSize="35px"
            fontFamily="Victor Mono"
            display="flex"
            justifyContent="center"
            ml={0}
          >
            {user.username}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <Image borderRadius="full" boxSize="150px" src={user.pic} alt={user.username} />
            <>
              <Text
                fontSize={{ base: '28px', md: '30px' }}
                fontFamily="Victor Mono"
                textAlign="left"
                w="100%"
              >
                Емейл: {user.email}
              </Text>
              <Text
                fontSize={{ base: '28px', md: '30px' }}
                fontFamily="Victor Mono"
                textAlign="left"
                w="100%"
              >
                Номер: {user.phone}
              </Text>
            </>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
