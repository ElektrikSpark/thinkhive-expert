import * as EventTypes from './eventTypes';
import { isMobile, isTablet } from './helpers';

(() => {
  const loadWidget = () => {
    const THINKHIVE_WRAPPER_ID = 'thinkhive-container';
    const IFRAME_ID = 'thinkhive-iframe-element';

    const script = document.currentScript;
    const expertId = script?.getAttribute('data-expertId');
    const iframe = document.createElement('iframe');
    const iframeUrl = `http://localhost:3000/expert-iframe/${expertId}`;
    let domainAllowed = true;

    // PRIVATE METHODS
    const ensureMounted = () => {
      if (!document.getElementById(IFRAME_ID)) {
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

    const initializeIframe = () => {
      if (!document.getElementById(IFRAME_ID)) {
        iframe.src = iframeUrl;
        iframe.id = IFRAME_ID;
        iframe.role = 'complementary';
      }
    };

    const mountIframe = () => {
      if (!document.getElementById('thinkhive-iframe-element')) {
        window.addEventListener('message', receiveMessage, false);
        const wrapper = document.createElement('div');
        wrapper.id = THINKHIVE_WRAPPER_ID;
        wrapper.style.zIndex = `${Number.MAX_SAFE_INTEGER}`;
        wrapper.style.position = 'absolute';

        ensureMounted();
        wrapper.appendChild(iframe);

        const ready = () => {
          if (document.body) {
            document.body.appendChild(wrapper);

            return;
          }
        };

        window.requestAnimationFrame(ready);
      }
    };

    const receiveMessage = (event) => {
      if (!!event && !!event.data && !!event.data.type) {
        switch (event.data.type) {
          case EventTypes.INITIATE_INIT_IFRAME:
            handleInitiateInitIframe();
            break;
          case EventTypes.CHANGE_CONTAINER_CLASS:
            onChangeContainerClass(event.data.value);
            break;
          case EventTypes.DOMAIN_NOT_ALLOWED:
            handleDomainNotAllowed();
            break;
          case EventTypes.LOCK_CLIENT_BODY:
            handleLockClientBody(event.data.value);
            break;
        }
      }
    };

    const handleInitiateInitIframe = () => {
      iframe?.contentWindow?.postMessage(
        {
          type: EventTypes.INIT_IFRAME,
          value: {
            expertId: expertId,
            topHost: window.location.host,
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
      iframe.className = classnames;
      iframe?.contentWindow?.postMessage(
        {
          type: EventTypes.CHANGE_CONTAINER_CLASS_DONE,
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
    initializeIframe();
    mountIframe();
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
