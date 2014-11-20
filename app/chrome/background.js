chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('main.html', {
    "bounds": {
      "width": 480,
      "height": 200
    },
    "frame": "none",
    "resizable": false
  });
});