// Визначає відступ для повідомлення залежно від відправника
export const isSameSenderMargin = (messages, m, i, userId) => {
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33; // Відступ для послідовних повідомлень того самого відправника (не поточного користувача)
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0; // Без відступу для останнього повідомлення або зміни відправника
  else return 'auto'; // Автоматичний відступ для повідомлень поточного користувача
};

// Перевіряє, чи є повідомлення від того самого відправника (не поточного користувача)
export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== m.sender._id || messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

// Перевіряє, чи є повідомлення останнім у чаті від іншого користувача
export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

// Перевіряє, чи є повідомлення від того самого користувача, що й попереднє
export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};

// Отримує ім’я користувача (не поточного) з чату
export const getSender = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1].username : users[0].username;
};

// Отримує повні дані іншого користувача з чату
export const getSenderFull = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};
