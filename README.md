# chrome-react-starter

This project builds a Chrome App based on React and Redux. Usage:

```
git clone https://github.com/raythree/chrome-react-starter.git
cd chrome-react-starter
gulp
```

The default gulp task bundles everything into the `dist` folder. 

To run as a Chrome App:

* Open chrome and navigate to `chrome://extensions`
* Make sure Developer Mode is checked
* Click "Load unpacked extension..." and navigate to the `dist` folder
* Launch app

You can run `gulp watch` while making changes to the source and it will rebundle. Click `Reload` to re-load the changes. You can also right-click inside the app to reload and also to open chrome dev tools.

To run tests with Karma:

```
gulp test
```


### Notes
* All static content and javascript that does not have npm packages gets placed in the `content` folder which is copied into the distribution. Thunk middleware is used to support asych actions with one of the buttons as an example. Both app.js and test/testReducers.js include this when creating the store.
* The `content/background.js` script set up the chrome window and sets the min/max sizes.


