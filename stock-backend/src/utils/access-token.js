let tokenCache = {
  token: null,
  expiresAt: null,
};

export async function getAccessToken() {
  const now = Date.now();

  if (tokenCache.token && tokenCache.expiresAt > now + 10000) {
    return tokenCache.token;
  }

  const jsonData = await generateAuthorizationToken();

  tokenCache = {
    token: jsonData.access_token,
    expiresAt: now + jsonData.expires_in * 1000,
  };

  return jsonData.access_token;
}

const generateAuthorizationToken = async () => {
  const data = await fetch("http://20.244.56.144/evaluation-service/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: process.env.EMAIL,
      name: process.env.NAME,
      rollNo: process.env.ROLL_NO,
      accessCode: process.env.ACCESS_CODE,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    }),
  });

  const jsonData = await data.json();
  return jsonData;
};
