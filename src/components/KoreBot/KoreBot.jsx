import { useEffect, useRef } from 'react';

const BOT_CONFIG = {
  botName:   process.env.REACT_APP_BOT_NAME,
  botId:     process.env.REACT_APP_BOT_ID,
  clientId:  process.env.REACT_APP_CLIENT_ID,
  jwtServer: process.env.REACT_APP_JWT_SERVER || 'https://jwt.saiteja.space/api/users/sts',
  apiUrl:    'https://platform.kore.ai/api/',
};

const KoreBot = () => {
  const instanceRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    const loadSDK = async () => {
      try {
        const { chatConfig, chatWindow } = await import('kore-web-sdk');

        const chatWindowInstance = new chatWindow();
        instanceRef.current = chatWindowInstance;

        const botOptions = chatConfig.botOptions;

        botOptions.koreAPIUrl    = BOT_CONFIG.apiUrl;
		botOptions.clientId = BOT_CONFIG.clientId;
        botOptions.userIdentity  = "anonymous";
        botOptions.botInfo       = {
          name: BOT_CONFIG.botName,
          _id:  BOT_CONFIG.botId,
        };

        chatConfig.JWTAsertion = (commitJWT) => {
          fetch(BOT_CONFIG.jwtServer, {
            method:  'POST',
            headers: { 'content-type': 'application/json' },
            body:    JSON.stringify({
              identity:    "anonymous",
              isAnonymous: false,
            }),
          })
            .then(res => res.ok ? res.json() : Promise.reject('JWT failed'))
            .then(res => {
              chatWindowInstance.setJWT(res.jwt);
              commitJWT();
            })
            .catch(err => console.error('Kore JWT error:', err));
        };

        chatWindowInstance.show(chatConfig);
        initializedRef.current = true;

      } catch (err) {
        console.error('Kore SDK load error:', err);
      }
    };

    loadSDK();
  },[]);

  // Don't render anything — the SDK injects its own UI
  return null;
};

export default KoreBot;