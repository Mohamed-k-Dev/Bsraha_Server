export const getAccessToken = (req) => {
    const token = req.headers.accesstoken;
    console.log( req.headers);
    if (!token) {
      throw new Error("Please provide access token", {
        cause: 401,
      });
    }
    return token;
  };