//do not migrate preload script into TypeScript
/**
 * Preload script for main browser window (team sidebar).
 * For webapp context preload, check ssb-interop
 */
const startup = () => {
    require('./assign-metadata').assignMetadata();
    const { loadSettings } = window;
  
    const noCommitVersion = loadSettings.version.split('-')[0];
    const shouldSuppressErrors = loadSettings.devMode;
    require('../renderer/bugsnag-setup').setupBugsnag(shouldSuppressErrors, noCommitVersion);
  
    if (loadSettings.bootstrapScript) {
      require(loadSettings.bootstrapScript);
    }
  };
  
  
  document.addEventListener('DOMContentLoaded', function() { // eslint-disable-line
    try {
      startup();
    } catch (e) {
      //tslint:disable-next-line:no-console
      console.log(e.stack);
  
      if (window.Bugsnag) {
        window.Bugsnag.notify(e, 'Renderer crash');
      }
  
      throw e;
    }
  });
  
  