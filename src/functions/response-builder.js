const ReturnResponse = (
  res,
  status,
  message,
  success,
  token = null,
  user = null
) => {
  if (token !== null && user === null) {
    return res.status(status).json({ message, success, token });
  }
  if (user !== null && token !== null) {
    return res.status(status).json({ message, success, token, user });
  }
  return res.status(status).json({ message, success });
};

export default ReturnResponse;
