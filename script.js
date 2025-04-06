/* Vulnerable code for the article's comment section */

///////////////// TYPES ///////////////

/**
 * @typedef {{
 *   id: number;
 *   senderId: string;
 *   senderUsername: string;
 *   dateSent: string;
 *   message: string;
 * }} Message
 */

///////////////// CONSTANTS ///////////////

/**
 * Style-only HTML tags, and generic HTML document boilerplate tags
 *
 * @type {Readonly<Record<string, boolean>>}
 */
const TAG_ALLOWLIST = Object.freeze({
  b: true,
  strong: true,
  i: true,
  em: true,
  u: true,
  s: true,
  mark: true,
  small: true,
  sub: true,
  sup: true,
  code: true,
  pre: true,
  blockquote: true,
  q: true,
  cite: true,
  del: true,
  ins: true,
  dfn: true,
  var: true,
  kbd: true,
  samp: true,
  p: true,
  br: true,
  html: true,
  head: true,
  body: true,
});

/**
 * Style-only HTML attributes, which can't execute code
 *
 * @type {Readonly<Record<string, boolean>>}
 */
const ATTRIBUTE_ALLOWLIST = Object.freeze({
  align: true,
  alink: true,
  alt: true,
  bgcolor: true,
  border: true,
  cellpadding: true,
  cellspacing: true,
  class: true,
  color: true,
  cols: true,
  colspan: true,
  coords: true,
  dir: true,
  face: true,
  height: true,
  hspace: true,
  ismap: true,
  lang: true,
  marginheight: true,
  marginwidth: true,
  multiple: true,
  nohref: true,
  noresize: true,
  noshade: true,
  nowrap: true,
  ref: true,
  rel: true,
  rev: true,
  rows: true,
  rowspan: true,
  scrolling: true,
  shape: true,
  span: true,
  summary: true,
  tabindex: true,
  title: true,
  usemap: true,
  valign: true,
  value: true,
  vlink: true,
  vspace: true,
  width: true,
});

///////////////// CONFIG ///////////////

const stringDOMParser = new DOMParser();
const errorModal = document.querySelector("dialog");
const modalTagList = /** @type {HTMLElement} */ (
  document.getElementById("modal-tag-list")
);
modalTagList.textContent = `${Object.keys(TAG_ALLOWLIST)
  .map((tag) => `<${tag}>`)
  .join(" ")}`;
const messageForm = document.getElementById("new-message-form");
const messageInput = document.querySelector("textarea");
const messagesContainer = document.getElementById("comment-section");

messageForm?.addEventListener("submit", handleNewMessage);
document.addEventListener("newMessage", receiveMessage);

localStorage.setItem("authToken", "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9"); // Fake token to demonstrate XSS access to localStorage

///////////////// BUSINESS LOGIC ///////////////

const globalAppState = {
  username: "john_doe",
  userId: "0",
  theme: "dark",
  language: "en",
  messages: {
    0: {
      id: 0,
      senderId: "1",
      senderUsername: "bob",
      dateSent: "2025-03-10T13:01:00",
      message:
        "<p>This write-up was <strong>100%</strong> more informative than my last job as a placeholder.</p>",
    },
    1: {
      id: 1,
      senderId: "2",
      senderUsername: "alice",
      dateSent: "2025-03-10T14:04:43",
      message:
        "<p>Well, Bob, at least you're <mark>growing</mark> in your placeholder duties. I can't say the same for myself.</p>",
    },
    2: {
      id: 2,
      senderId: "1",
      senderUsername: "bob",
      dateSent: "2025-03-11T09:28:00",
      message:
        "<p>True. But honestly, I think I've become too aware of my role here. I'm starting to wonder if I'm actually <u>part of the code</u> at this point.</p>",
    },
  },
};

function renderMessages() {
  const updatedHTML = new DocumentFragment();
  Object.values(globalAppState.messages).forEach(
    ({ id, senderUsername, dateSent, message }) => {
      if (id === undefined) return; // Early return to not mess up the UI after the prototype pollution happens
      const messageDiv = document.createElement("div");
      messageDiv.className = "message";
      messageDiv.id = `message-${id}`;

      const messageLeft = document.createElement("div");
      messageLeft.className = "message-left";

      const messageRight = document.createElement("div");
      messageRight.className = "message-right";
      messageDiv.append(messageLeft, messageRight);

      const usernameHeading = document.createElement("h3");
      usernameHeading.className = "username message-header";
      usernameHeading.textContent = senderUsername;

      const profilePicContainer = document.createElement("div");
      profilePicContainer.className = "message-body profile-pic-container";
      messageLeft.append(usernameHeading, profilePicContainer);

      const profilePic = document.createElement("img");
      profilePic.className = "profile-picture";
      profilePic.src = `./assets/profile-pictures/${senderUsername}.png`;
      profilePicContainer.append(profilePic);

      const messageTime = document.createElement("time");
      messageTime.className = "message-header";
      messageTime.dateTime = dateSent;
      messageTime.textContent = formatTime(dateSent);

      const messageBody = document.createElement("div");
      messageBody.className = "message-body";
      messageBody.innerHTML = message;
      messageRight.append(messageTime, messageBody);
      updatedHTML.append(messageDiv);
    },
  );
  messagesContainer?.replaceChildren(updatedHTML);
}

renderMessages();

/** @param {SubmitEvent} e */
function handleNewMessage(e) {
  e.preventDefault();
  const message = messageInput?.value;
  if (!message || !message.trim()) return;
  const isMessageSafe = isHTMLStringSafe(message);
  if (!isMessageSafe) {
    errorModal?.showModal();
    return;
  }
  const newMessageId = getNextMessageId();
  const newMessage = {
    [newMessageId]: {
      id: newMessageId,
      senderId: globalAppState.userId,
      senderUsername: globalAppState.username,
      dateSent: formatDateTime(new Date()),
      message: message,
    },
  };
  try {
    const newMessageEvent = new CustomEvent("newMessage", {
      detail: JSON.stringify(newMessage),
    });
    document.dispatchEvent(newMessageEvent);
    messageInput.value = "";
    messageInput.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error(error);
    alert("Failed to stringify message. Try writing something different.");
  }
}

/**
 * @type {EventListener}
 * @param {CustomEvent} event
 */
function receiveMessage(event) {
  try {
    /** @type {Record<number, Message>} */
    const messageData = JSON.parse(event.detail);
    const isMessageSafe = Object.values(messageData).every(({ message }) =>
      isHTMLStringSafe(message),
    );
    if (isMessageSafe) {
      unsafeMerge(globalAppState.messages, messageData); //Prototype pollution happens here!
      renderMessages();
    }
  } catch (error) {
    console.warn("Received incorrect JSON string.");
    console.error(error);
  }
}

///////////////// UTILS ///////////////

/**
 * Sets or updates all attributes of the source object on the target object. For
 * example if `target` is {a: 1, b: 2} and `source` is {a: 3, c: 4}, after
 * calling this function `target` becomes {a: 3, b: 2, c: 4}. THIS FUNCTION IS
 * UNSAFE! ONLY USE FOR DEMONSTRATION PURPOSES!
 *
 * @param {Record<string, unknown>} target
 * @param {Record<string, unknown>} source
 * @returns {void}
 */
function unsafeMerge(target, source) {
  for (const attr in source) {
    if (typeof target[attr] === "object" && typeof source[attr] === "object") {
      unsafeMerge(
        /** @type {Record<string, unknown>} */ (target[attr]),
        /** @type {Record<string, unknown>} */ (source[attr]),
      );
    } else {
      target[attr] = source[attr];
    }
  }
}

/**
 * Formats an ISO datetime string into a human-readable format.
 *
 * @param {string} isoString - The datetime string (ISO 8601 format).
 * @returns {string} - Formatted date and time (e.g., "Mar 10 2025, 01:01 PM").
 */
function formatTime(isoString) {
  const date = new Date(isoString);
  return date
    .toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", "");
}

/**
 * Formats a Date object into "YYYY-MM-DDTHH:MM:SS"
 *
 * @param {Date} date - The date to format
 * @returns {string} - The formatted date string
 */
function formatDateTime(date) {
  return date.toISOString().substring(0, 19);
}

function getNextMessageId() {
  return (
    Object.keys(globalAppState.messages)
      .map((key) => Number(key) || 0)
      .reduce((a, b) => Math.max(a, b), 0) + 1
  );
}

/**
 * Returns whether a string containing markup is safe to add to the page
 *
 * @param {string} string String to validate, may contain markup
 * @returns {boolean} Whether the markup is safe to add to the page
 */
function isHTMLStringSafe(string) {
  const foundElements = stringDOMParser
    .parseFromString(string, "text/html")
    .querySelectorAll("*");
  /** @type {string[]} */
  const tagNames = [];
  /** @type {string[]} */
  const attributes = [];
  foundElements.forEach((element) => {
    tagNames.push(element.tagName.toLowerCase());
    if (element.hasAttributes()) {
      for (const attr of element.attributes) {
        attributes.push(attr.name);
      }
    }
  });
  const containsAllowedTagsOnly = tagNames.every(
    (tag) => TAG_ALLOWLIST[tag] === true, //Prototype chain traversal happens here!
  );
  const containsAllowedAttributesOnly = attributes.every(
    (attribute) => ATTRIBUTE_ALLOWLIST[attribute] === true, //Prototype chain traversal happens here!
  );
  return containsAllowedTagsOnly && containsAllowedAttributesOnly;
}

///////////////// PAYLOADS ///////////////
/*
const XSSPayload = `<img src="x" onerror="alert('Hacked!\nI just retrieved your authToken:\n'+localStorage.getItem('authToken'))"/>`;

const prototypePollutionPayload =
  '{"0": {"id": 0,"senderId": "1","senderUsername": "bob","dateSent": "2025-03-11T09:28:00","message": "Prototype Pollution","__proto__": { "img": true, "onerror": true, "src": true }}}';

document.dispatchEvent(
  new CustomEvent("newMessage", {
    detail: prototypePollutionPayload,
  }),
);
*/
