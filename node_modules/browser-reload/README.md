# Automatic Browser Reloads

Automatically reloads web pages when changed. No server side logic required.
Works fine with Apache.


## Usage

Put this anywhere in your HTML file:

```
<script src="reload.min.js"></script>
```

The minified source is a single line. You may also embed the source directly.

NOTE: This is a development tool. Remove the script before deployment.


## How it works

Does `HEAD` requests with AJAX polling every second. If the `Last-Modified`
header is greater than the page load timestamp it does a `location.reload()`.

The host MUST be `localhost` or else the script will not send any requests.
This means the page containing the script has to be served by a web server.


## Why a Node package?

This script is used by [Consolify][] which turns your browser window into a
console and runs Node modules via Browserify.


## License

MIT


[Consolify]: https://github.com/mantoni/consolify
