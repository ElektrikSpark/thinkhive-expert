(() => {
  // event types
  const INITIATE_INIT_IFRAME = 'INITIATE_INIT_IFRAME';
  const INIT_IFRAME = 'INIT_IFRAME';
  const CHANGE_CONTAINER_CLASS = 'CHANGE_CONTAINER_CLASS';
  const CHANGE_CONTAINER_CLASS_DONE = 'CHANGE_CONTAINER_CLASS_DONE';
  const DOMAIN_NOT_ALLOWED = 'DOMAIN_NOT_ALLOWED';
  const BOOTSTRAP_DONE = 'BOOTSTRAP_DONE';
  const LOCK_CLIENT_BODY = 'LOCK_CLIENT_BODY';

  // constants
  const CONTROLLER_WRAPPER_ID = 'thinkhive-controller-container';
  const CHAT_WRAPPER_ID = 'thinkhive-chat-container';
  const CONTROLLER_IFRAME_ID = 'thinkhive-controller-iframe';
  const CHAT_IFRAME_ID = 'thinkhive-chat-iframe';

  const CHAT_WRAPPER_HEIGHT = '600px';
  const CHAT_WRAPPER_WIDTH = '400px';

  const CONTROLLER_SIZE = 50; // size of the chat button in pixels
  const CONTROLLER_RADIUS = CONTROLLER_SIZE / 2; // radius of the chat button in pixels
  const CONTROLLER_BACKGROUND_COLOR = 'black'; // background color of the chat button
  const CONTROLLER_ICON = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="#FFFFFF"/>
  </svg>
`;

  // helpers
  const breakpoint = '(min-width: 550px)';
  const isMobile = () => window.innerWidth <= 600;
  const isTablet = () => window.innerWidth > 600 && window.innerWidth < 768;

  // needs to be out here
  const script = document.currentScript;

  const loadWidget = () => {
    const expertId = script?.getAttribute('data-expertId');
    const controllerIframe = document.createElement('iframe');
    const chatIframe = document.createElement('iframe');
    const controllerIframeUrl = '';
    const chatIframeUrl = `http://localhost:3000/expert-iframe/${expertId}`;
    let domainAllowed = true;

    // PRIVATE METHODS
    const ensureMounted = () => {
      if (!document.getElementById(CHAT_IFRAME_ID)) {
        throw new Error('not mounted');
      }
    };

    const ensureAllowed = () => {
      if (!domainAllowed) {
        throw new Error(
          `${window.location.host} is not permitted to use this expert ${expertId}`
        );
      }
    };

    const createController = () => {
      const controller = document.createElement('div');
      controller.id = CONTROLLER_WRAPPER_ID;
      controller.innerHTML = CONTROLLER_ICON;
      controller.style.position = 'fixed';

      controller.style.bottom = '20px';
      controller.style.right = '20px';

      controller.style.display = 'flex';
      controller.style.alignItems = 'center';
      controller.style.justifyContent = 'center';
      controller.style.width = CONTROLLER_SIZE + 'px';
      controller.style.height = CONTROLLER_SIZE + 'px';

      controller.style.borderRadius = CONTROLLER_RADIUS + 'px';
      controller.style.backgroundColor = CONTROLLER_BACKGROUND_COLOR;
      controller.style.boxShadow = '0 4px 8px 0 rgba(0, 0, 0, 0.2)';
      controller.style.zIndex = `${Number.MAX_SAFE_INTEGER - 1}`;
      controller.style.cursor = 'pointer';

      controller.addEventListener('click', () => {
        const chatWrapper = document.getElementById(CHAT_WRAPPER_ID);
        if (chatWrapper) {
          if (chatWrapper.style.display === 'none') {
            chatWrapper.style.display = 'flex';
          } else {
            chatWrapper.style.display = 'none';
          }
        }
      });

      return controller;
    };

    const createChatWrapper = () => {
      const chatWrapper = document.createElement('div');
      chatWrapper.id = CHAT_WRAPPER_ID;
      chatWrapper.style.position = 'fixed';

      chatWrapper.style.flexDirection = 'column';
      chatWrapper.style.justifyContent = 'space-between';
      chatWrapper.style.bottom = '80px';
      chatWrapper.style.right = '20px';
      chatWrapper.style.width = '85vw';
      chatWrapper.style.height = '70vh';

      chatWrapper.style.zIndex = `${Number.MAX_SAFE_INTEGER - 1}`;
      chatWrapper.style.backgroundColor = 'black';
      chatWrapper.style.display = 'none';
      chatWrapper.style.backgroundColor = '#fff';
      chatWrapper.style.boxShadow = '0 4px 8px 0 rgba(0, 0, 0, 0.2)';
      chatWrapper.style.border = '1px solid #D5D4D5';
      chatWrapper.style.borderRadius = '10px';
      chatWrapper.style.padding = '5px';

      return chatWrapper;
    };

    const initializeIframes = () => {
      // if (!document.getElementById(CONTROLLER_IFRAME_ID)) {
      //   controllerIframe.src = controllerIframeUrl;
      //   controllerIframe.id = CONTROLLER_IFRAME_ID;
      //   controllerIframe.role = 'complementary';
      // }

      if (!document.getElementById(CHAT_IFRAME_ID)) {
        chatIframe.src = chatIframeUrl;
        chatIframe.id = CHAT_IFRAME_ID;
        chatIframe.role = 'complementary';
        chatIframe.width = '100%';
        chatIframe.height = '100%';
        chatIframe.style.border = 'none';
      }
    };

    const handleChatWrapperSizeChange = (chatWrapper) => {
      const mediaQuery = window.matchMedia(breakpoint);

      if (mediaQuery.matches) {
        chatWrapper.style.height = CHAT_WRAPPER_HEIGHT;
        chatWrapper.style.width = CHAT_WRAPPER_WIDTH;
      } else {
        chatWrapper.style.height = '70vh';
        chatWrapper.style.width = '85vw';
      }
    };

    const addMediaQueryListener = (chatWrapper) => {
      const mediaQuery = window.matchMedia(breakpoint);
      mediaQuery.addEventListener('change', () =>
        handleChatWrapperSizeChange(chatWrapper)
      );
    };

    const mountIframes = () => {
      // took out controller iframe
      if (!document.getElementById(CHAT_IFRAME_ID)) {
        window.addEventListener('message', receiveMessage, false);

        const controller = createController();
        const chatWrapper = createChatWrapper();

        chatWrapper.appendChild(chatIframe);

        addMediaQueryListener(chatWrapper);
        handleChatWrapperSizeChange(chatWrapper);

        const ready = () => {
          if (document.body) {
            document.body.appendChild(controller);
            document.body.appendChild(chatWrapper);
            return;
          }
        };

        window.requestAnimationFrame(ready);
      }
    };

    const receiveMessage = (event) => {
      if (!!event && !!event.data && !!event.data.type) {
        switch (event.data.type) {
          case INITIATE_INIT_IFRAME:
            handleInitiateInitIframe();
            break;
          case CHANGE_CONTAINER_CLASS:
            onChangeContainerClass(event.data.value);
            break;
          case BOOTSTRAP_DONE:
            break;
          case DOMAIN_NOT_ALLOWED:
            handleDomainNotAllowed();
            break;
          case LOCK_CLIENT_BODY:
            handleLockClientBody(event.data.value);
            break;
          default:
            break;
        }
      }
    };

    const handleInitiateInitIframe = () => {
      chatIframe?.contentWindow?.postMessage(
        {
          type: INIT_IFRAME,
          value: {
            expertId: expertId,
            topHost: window.location.hostname,
          },
        },
        '*'
      );
    };

    const onChangeContainerClass = (classnames) => {
      ensureAllowed();
      if (isMobile() || isTablet()) {
        classnames = `${classnames}-mobile`;
      }
      chatIframe.className = classnames;
      chatIframe?.contentWindow?.postMessage(
        {
          type: CHANGE_CONTAINER_CLASS_DONE,
          value: {
            deviceWidth: window.innerWidth,
          },
        },
        '*'
      );
    };

    const handleDomainNotAllowed = () => {
      domainAllowed = false;
    };

    const handleLockClientBody = (unlock) => {
      if (unlock) {
        document.getElementsByTagName('body')[0].style.overflow = '';
      } else if (!unlock && isMobile()) {
        document.getElementsByTagName('body')[0].style.overflow = 'hidden';
      }
    };

    // Init
    initializeIframes();
    mountIframes();
  };

  if (document.readyState === 'complete') {
    loadWidget();
  } else {
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'complete') {
        loadWidget();
      }
    });
  }
})();
