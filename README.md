Steampunk IRC is a simple web-based IRC client. A user's browser
connects to a server which maintains a persistent connection to an
IRC server (similar to bouncers like [ZNC][]) and relays messages
between the browser and the IRC server. Users can easily see messages
they missed while they were offline.

The name *Steampunk* was chosen because my colleague [Pascal Finette][finette]
once jokingly referred to IRC as [steampunk][], which I found both
humorous and apt.

This project is highly experimental and the UI is quite preliminary.

## Quick Start

    git clone git://github.com/toolness/steampunk.git
    cd steampunk
    npm install
    npm test
    cp config.sample.js config.js

Edit `config.js` to taste, then run:

    node app.js

Navigate to [localhost:3000/test][] to run the browser-side test suite.
Then go to [localhost:3000][].

Type `/login username password` into the command line and press enter. Then
type `/` for a list of commands, and use `@username msg` to send a private
message to a user or `#channel msg` to send a message to a channel you're 
joined to. (You can abbreviate the channel name and the client will
automatically send your message to the closest unique channel that
you're joined to.)

  [ZNC]: http://znc.in
  [finette]: http://www.finette.com/
  [steampunk]: http://en.wikipedia.org/wiki/Steampunk
  [localhost:3000/test/]: http://localhost:3000/test/
  [localhost:3000]: http://localhost:3000/
