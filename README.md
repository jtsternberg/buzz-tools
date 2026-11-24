# buzz-tools

## chrome-extension

Makes plain-text `buzz://` URLs clickable on any page (GitHub comments, Asana, etc.). Clicking one hands it to macOS, which opens Buzz.app (it registers the `buzz:` scheme); Chrome asks once, tick "Always allow" to skip the prompt.

Install: `chrome://extensions` → Developer mode → Load unpacked → pick `chrome-extension/`.

Why not "teach Chrome the protocol": no extension API can add schemes to Chrome's or a site's link allowlist. GitHub strips non-allowlisted `href` schemes server-side when it renders markdown, so the text has to be relinked in the page.
