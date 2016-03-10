/**
 * Listens for the app launching then creates the window
 *
 * @see http://developer.chrome.com/apps/app.window.html
 */
chrome.app.runtime.onLaunched.addListener(function() {
  var window = chrome.app.window.create('index.html', {
    id: 'main',
    bounds: { width: 620, height: 500 },
    innerBounds: {minWidth: 400, minHeight: 400}
  });

});
