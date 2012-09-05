[![Build Status](https://secure.travis-ci.org/toolness/steampunk.png?branch=master)](http://travis-ci.org/toolness/steampunk)

Steampunk IRC is a simple web-based IRC client with Twitter integration.
A user's browser connects to a server which maintains a persistent connection
to an IRC server (similar to bouncers like [ZNC][]) and relays messages
between the browser and the IRC server. Users can easily see messages
they missed while they were offline.

<img src="http://u.toolness.org/vjoaf">

The name *Steampunk* was chosen because my colleague [Pascal Finette][finette]
once jokingly referred to IRC as [steampunk][], which I found both
humorous and apt.

This project is highly experimental and the UI is quite preliminary.

## Quick Start

    git clone git://github.com/toolness/steampunk.git
    cd steampunk
    npm install
    npm test
    cp config.sample.json storage-data/config.json

Edit `config.json` to taste, then run:

    node app.js

Navigate to [localhost:3000/test][] to run the browser-side test suite.
Then go to [localhost:3000][].

## Basic Commands

Type **/** to see a list of all available commands.

* **/login** *username* *password* - Logs you into the server with the given
username and password, which should be listed in `config.json`. Your
credentials are stored persistently in your browser; if you want to purge
them, use **/logout**.

* **/join** *#channel* - Joins you to *#channel*.

* **/twittername** *nick* *twittername* - Associates the IRC user *nick* with
the Twitter user *twittername*. This association is global for all users
of the Steampunk server you're connected to.

* **#channel** *message* - Broadcasts a message to **#channel**. You can 
abbreviate the channel name and the client will automatically send your
message to the closest unique channel that you're joined to.

* **@username** *message* - Sends a private message to *username*.

## License

(The MIT License)

Copyright (c) 2012 Atul Varma &lt;atul@mozilla.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

  [ZNC]: http://znc.in
  [finette]: http://www.finette.com/
  [steampunk]: http://en.wikipedia.org/wiki/Steampunk
  [localhost:3000/test]: http://localhost:3000/test/
  [localhost:3000]: http://localhost:3000/
