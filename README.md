## Video and Messaging Chatapp

### To run the app locally
- Run `npm install`
- Run `npm run dev`
- Navigate to [http://localhost:8080/](http://localhost:8080/)

### Common browser problems that block the socket for messaging and/or video-calling:
- CORS block:
  - Solution for Chrome:
    - [Get a browser addon that unblocks CORS.](https://chrome.google.com/webstore/detail/moesif-origin-cors-change/digfbfaphojjndkpccljibejjbppifbc?hl=en-US)

- getUserMedia() not supported:
  - Solution for Chrome:
    - Go to `chrome://flags/#unsafely-treat-insecure-origin-as-secure`.
    - Enable `Insecure origins treated as secure` and write in the corresponding description box `https://video-messaging-chatapp.herokuapp.com/`.
