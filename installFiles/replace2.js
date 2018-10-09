/**
 * The preload script needs to stay in regular ole JavaScript, because it is
 * the point of entry for electron-compile.
 */

const allowedChildWindowEventMethod = [
    'windowWithTokenBeganLoading',
    'windowWithTokenFinishedLoading',
    'windowWithTokenCrashed',
    'windowWithTokenDidChangeGeometry',
    'windowWithTokenBecameKey',
    'windowWithTokenResignedKey',
    'windowWithTokenWillClose'
  ];
  
  if (window.location.href !== 'about:blank') {
    const preloadStartTime = process.hrtime();
  
    require('./assign-metadata').assignMetadata();
    if (window.parentWebContentsId) {
      //tslint:disable-next-line:no-console max-line-length
      const warn = () => console.warn(`Deprecated: direct access to global object 'parentInfo' will be disallowed. 'parentWebContentsId' will be available until new interface is ready.`);
      Object.defineProperty(window, 'parentInfo', {
        get: () => {
          warn();
          return {
            get webContentsId() {
              warn();
              return parentWebContentsId;
            }
          };
        }
      });
    }
  
    const { ipcRenderer, remote } = require('electron');
  
    ipcRenderer
      .on('SLACK_NOTIFY_CHILD_WINDOW_EVENT', (event, method, ...args) => {
        try {
          if (!TSSSB || !TSSSB[method]) throw new Error('Webapp is not fully loaded to execute method');
          if (!allowedChildWindowEventMethod.includes(method)) {
            throw new Error('Unsupported method');
          }
  
          TSSSB[method](...args);
        } catch (error) {
          console.error(`Cannot execute method`, { error, method }); //tslint:disable-line:no-console
        }
      });
  
    ipcRenderer
      .on('SLACK_REMOTE_DISPATCH_EVENT', (event, data, origin, browserWindowId) => {
        const evt = new Event('message');
        evt.data = JSON.parse(data);
        evt.origin = origin;
        evt.source = {
          postMessage: (message) => {
            if (!desktop || !desktop.window || !desktop.window.postMessage) throw new Error('desktop not ready');
            return desktop.window.postMessage(message, browserWindowId);
          }
        };
  
        window.dispatchEvent(evt);
        event.sender.send('SLACK_REMOTE_DISPATCH_EVENT');
      });
  
    const { init } = require('electron-compile');
    const { assignIn } = require('lodash');
    const path = require('path');
  
    const { isPrebuilt } = require('../utils/process-helpers');
  
    //tslint:disable-next-line:no-console
    process.on('uncaughtException', (e) => console.error(e));
  
    /**
     * Patch Node.js globals back in, refer to
     * https://electron.atom.io/docs/api/process/#event-loaded.
     */
    const processRef = window.process;
    process.once('loaded', () => {
      window.process = processRef;
    });
  
    window.perfTimer.PRELOAD_STARTED = preloadStartTime;
  
    // Consider "initial team booted" as whether the workspace is the first loaded after Slack launches
    ipcRenderer.once('SLACK_PRQ_TEAM_BOOT_ORDER', (_event, order) => {
      window.perfTimer.isInitialTeamBooted = order === 1;
    });
    ipcRenderer.send('SLACK_PRQ_TEAM_BOOTED'); // Main process will respond SLACK_PRQ_TEAM_BOOT_ORDER
  
    const resourcePath = path.join(__dirname, '..', '..');
    const mainModule = require.resolve('../ssb/main.ts');
    const isDevMode = loadSettings.devMode && isPrebuilt();
  
    init(resourcePath, mainModule, !isDevMode);
  }
  
  document.addEventListener("DOMContentLoaded", function() {
  	document.addEventListener("keydown", function (e) {
      if (e.which === 123) {
        require('remote').getCurrentWindow().toggleDevTools();
      } else if (e.which === 116) {
        location.reload();
      }
    });
    // Then get its webviews
    let webviews = document.querySelectorAll(".TeamView webview");
  
    // Fetch our CSS in parallel ahead of time
    const cssPath = 'https://cdn.rawgit.com/laCour/slack-night-mode/master/css/raw/black.css';
    let cssPromise = fetch(cssPath).then(response => response.text());
  
    let customCustomCSS = `
    :root {
      /* Modify these to change your theme colors: */
      --primary: #61AFEF;
      --text: #ABB2BF;
      --background: #4D394B;
      --background-elevated: #4D394B;
    }
    pre.special_formatting
    {
      background-color: #4D394B !important;
      color: #ffffff !important;
      border: solid;
      border-width: 1px !important;
    }
    #footer {
      background: #4D394B !important;
    }

    #im_browser .im_browser_row,
    .c-message_list__day_divider__line
    {
      border-top: 1px solid #afafaf;
    }
    div.c-message__content > span  {
      color: #fff !important
    }
     div > div.c-message__content > div  {
      color: #fff !important
     }

    div.c-message__content  {
      color: #fff !important
    }

    div.c-message.c-message--light.c-message--hover,
    #file_preview_scroller .texty_comment_input,
    .c-message.c-message--light.c-message--hover.c-message--adjacent.c-message--last
    {
      color: #fff !important;
      background-color: #4D394B !important;
    }

    #file_preview_scroller .message_sender,
    #file_preview_scroller .file_viewer_link,
    #file_preview_scroller .comment_body,
    #file_preview_scroller .ts_tip_btn,
    #file_preview_scroller .file_comment_tip,
    #file_preview_scroller .file_meta,
    #file_preview_scroller .file_ssb_download_link,
    .c-member--medium,
    .c-member__display-name,
    .c-member__secondary-name--medium,
    .c-team__display-name,
    .c-usergroup__handle,
    .c-message_attachment,
    .c-message_attachment__pretext,
    .c-message_attachment__button,
    .c-message_attachment__select,
    .c-message_list__day_divider__label,
    .c-file__title,
    .c-file__meta,
    .c-reaction__count,
    .c-reaction_add__icon--fg,
    .c-input_select_options_list__option,
    .c-input_select_options_list_container:not(.c-input_select_options_list_container--always-open),
    span.c-message__body,
    a.c-message__sender_link,
    div.c-message_attachment__row,
    div.p-message_pane__foreword__description span,
    ts-conversation.message_container ts-message .message_content .message_sender,
    span.c-message_attachment__media_trigger.c-message_attachment__media_trigger--caption
    {
      color: #afafaf !important;
    }

    .c-reaction_add__icon--bg
    {
      color: #4D394B !important;
    }

    div.c-virtual_list__scroll_container,
    div.c-message:hover,
    .c-file_container,
    .c-file__slide--meta,
    .c-reaction,
    .c-reaction_add,
    .c-message_list__day_divider__label__pill,
    .c-button--outline,
    .c-message_attachment__button,
    .c-message_attachment__select,
    .c-input_select_options_list_container:not(.c-input_select_options_list_container--always-open),
    #im_browser #im_list_container:not(.keyboard_active).not_scrolling .im_browser_row:not(.disabled_dm):hover
    {
      background-color: #4D394B !important;
    }

    .c-file__icon:after
    {
      border: 3px solid #4D394B;
    }

    .c-button--outline,
    .c-message_attachment__button,
    .c-message_attachment__select,
    .c-file_container,
    .c-reaction,
    .c-reaction_add,
    .c-input_select_options_list_container:not(.c-input_select_options_list_container--always-open)
    {
      border: 1px solid;
      border-color: #4D394B;
    }

    .c-file_container:hover,
    .c-reaction:focus,
    .c-reaction:hover,
    .c-reaction_add:focus,
    .c-reaction_add:hover,
    {
      border-color: #afafaf;
    }

    .c-file_container--has_thumb .c-file__actions:before
    {
      background-image: linear-gradient(90deg,hsla(0,0%,100%,0),#4D394B 20px);
    }

    .c-member_slug--link
    {
      background: #4D394B;
    }

    .c-member_slug--link:hover
    {
      background: #25272a;
    }

    .p-message_pane .c-message_list:not(.c-virtual_list--scrollbar),
    .p-message_pane .c-message_list.c-virtual_list--scrollbar > .c-scrollbar__hider {
        z-index: 0;
    }
    .ql-placeholder {
      color: #FEFEFE !important;
    }

    .c-unified_member__secondary-name,
    .c-unified_member__display-name,
    .c-channel_name  {
      color: #fff;
    }

    .c-search__input_and_close,
    .c-search__input_box,
    .c-search-autocomplete,
    .c-search_autocomplete > footer,
    .c-search_autocomplete__footer_navigation_help {
      color: #fff;
      background: #4D394B;
    }

    .ReactModal__Content ReactModal__Content--after-open {
      background: #4D394B !important;
    }
    #client_header > div.channel_header {
      background: #4D394B !important;

    }
    #msg_input {
      background: #4D394B !important;
      border: 0 !important;

    }
    #primary_file_button {
      background: #4D394B !important;
      border: 0 !important;
    }
    
    #team_menu {
      background: #4D394B !important;
    }
    `
  
    // Insert a style tag into the wrapper view
    cssPromise.then(css => {
       let s = document.createElement('style');
       s.type = 'text/css';
       s.innerHTML = css + customCustomCSS;
       document.head.appendChild(s);
    });
  
    // Wait for each webview to load
    webviews.forEach(webview => {
       webview.addEventListener('ipc-message', message => {
          if (message.channel == 'didFinishLoading')
             // Finally add the CSS into the webview
             cssPromise.then(css => {
                let script = `
                      let s = document.createElement('style');
                      s.type = 'text/css';
                      s.id = 'slack-custom-css';
                      s.innerHTML = \`${css + customCustomCSS}\`;
                      document.head.appendChild(s);
                      `
                webview.executeJavaScript(script);
             })
       });
    });
  });