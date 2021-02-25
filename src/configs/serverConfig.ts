export default {
  isDev: process.env.NODE_ENV === 'development',
  jwtAuthSecret: process.env.JWT_SECRET,
  socketPath: process.env.SOCKET_PATH,
};
