export const getAccessToken = (req) => {
    const token = req.headers.accesstoken;
    if (!token) {
      throw new Error("Please provide access token", {
        cause: 401,
      });
    }
    return token;
  };