const SPREADSHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";
const SESSION_DAYS = 14;
const USER_CACHE_SECONDS = 300;
let databaseReady = false;
let spreadsheetCache = null;
const sheetCache = {};

const SHEETS = {
  users: ["id", "email", "password_hash", "salt", "session_token", "session_expires_at", "created_at"],
  vocab_sets: ["id", "user_id", "title", "description", "is_public", "created_at"],
  vocab_items: ["id", "vocab_set_id", "user_id", "word", "meaning", "created_at"],
  password_resets: ["id", "user_id", "token", "expires_at", "used", "created_at"]
};

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    setupDatabase();

    const body = parseBody(e);
    const action = body.action || "";

    switch (action) {
      case "register":
        return json(registerUser(body));
      case "login":
        return json(loginUser(body));
      case "me":
        return json(getCurrentUser(body));
      case "logout":
        return json(logoutUser(body));
      case "changePassword":
        return json(changePassword(body));
      case "forgotPassword":
        return json(forgotPassword(body));
      case "resetPassword":
        return json(resetPassword(body));
      case "listSets":
        return json(listSets(body));
      case "getSet":
        return json(getSet(body));
      case "getSetBundle":
        return json(getSetBundle(body));
      case "createSet":
        return json(createSet(body));
      case "deleteSet":
        return json(deleteSet(body));
      case "listItems":
        return json(listItems(body));
      case "addItem":
        return json(addItem(body));
      case "importItems":
        return json(importItems(body));
      case "deleteItem":
        return json(deleteItem(body));
      default:
        return json({ ok: false, error: "Unknown action" });
    }
  } catch (err) {
    return json({ ok: false, error: err.message || String(err) });
  }
}

function parseBody(e) {
  if (e && e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }

  return (e && e.parameter) ? e.parameter : {};
}

function json(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupDatabase() {
  if (databaseReady) return;

  const schemaKey = "DB_SCHEMA_READY_" + SPREADSHEET_ID;
  const properties = PropertiesService.getScriptProperties();
  if (properties.getProperty(schemaKey) === "1") {
    databaseReady = true;
    return;
  }

  const ss = getSpreadsheet();

  Object.keys(SHEETS).forEach(function (name) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(SHEETS[name]);
      sheet.setFrozenRows(1);
    }
    sheetCache[name] = sheet;
  });

  databaseReady = true;
  properties.setProperty(schemaKey, "1");
}

function getSpreadsheet() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID.indexOf("PASTE_") === 0) {
    throw new Error("Missing SPREADSHEET_ID in Apps Script");
  }

  if (!spreadsheetCache) {
    spreadsheetCache = SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  return spreadsheetCache;
}

function getSheet(name) {
  if (!sheetCache[name]) {
    sheetCache[name] = getSpreadsheet().getSheetByName(name);
  }

  return sheetCache[name];
}

function readRows(name) {
  const sheet = getSheet(name);
  const values = sheet.getDataRange().getValues();
  const headers = values.shift() || [];

  return values
    .filter(function (row) {
      return row.some(function (cell) {
        return cell !== "";
      });
    })
    .map(function (row, index) {
      const obj = { _row: index + 2 };
      headers.forEach(function (header, i) {
        obj[header] = row[i];
      });
      return obj;
    });
}

function appendRow(name, obj) {
  appendRows(name, [obj]);
}

function appendRows(name, objects) {
  if (!objects.length) return;

  const sheet = getSheet(name);
  const headers = SHEETS[name];
  const values = objects.map(function (obj) {
    return headers.map(function (key) {
      return obj[key] === undefined ? "" : obj[key];
    });
  });
  const startRow = sheet.getLastRow() + 1;
  const requiredLastRow = startRow + values.length - 1;

  if (requiredLastRow > sheet.getMaxRows()) {
    sheet.insertRowsAfter(
      sheet.getMaxRows(),
      requiredLastRow - sheet.getMaxRows()
    );
  }

  sheet
    .getRange(startRow, 1, values.length, headers.length)
    .setValues(values);
}

function updateRow(name, rowNumber, patch) {
  const sheet = getSheet(name);
  const headers = SHEETS[name];
  const existing = sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0];

  headers.forEach(function (key, i) {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      existing[i] = patch[key];
    }
  });

  sheet.getRange(rowNumber, 1, 1, headers.length).setValues([existing]);
}

function deleteRow(name, rowNumber) {
  getSheet(name).deleteRow(rowNumber);
}

function replaceRows(name, objects) {
  const sheet = getSheet(name);
  const headers = SHEETS[name];
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, headers.length).clearContent();
  }

  if (!objects.length) return;

  const values = objects.map(function (obj) {
    return headers.map(function (key) {
      return obj[key] === undefined ? "" : obj[key];
    });
  });

  const requiredLastRow = values.length + 1;
  if (requiredLastRow > sheet.getMaxRows()) {
    sheet.insertRowsAfter(
      sheet.getMaxRows(),
      requiredLastRow - sheet.getMaxRows()
    );
  }

  sheet.getRange(2, 1, values.length, headers.length).setValues(values);
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function toBool(value) {
  return value === true || String(value).toLowerCase() === "true";
}

function makeToken() {
  return Utilities.getUuid() + "-" + Utilities.getUuid();
}

function hashPassword(password, salt) {
  const raw = String(password) + ":" + String(salt);
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw);

  return bytes.map(function (byte) {
    const value = byte < 0 ? byte + 256 : byte;
    const hex = value.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at
  };
}

function getUserCache() {
  return CacheService.getScriptCache();
}

function cacheSessionUser(user) {
  if (!user || !user.session_token) return;
  getUserCache().put(
    "session:" + user.session_token,
    JSON.stringify(user),
    USER_CACHE_SECONDS
  );
}

function removeCachedSession(token) {
  if (token) {
    getUserCache().remove("session:" + token);
  }
}

function requireUser(token) {
  const sessionToken = String(token || "");
  if (!sessionToken) {
    throw new Error("Unauthenticated");
  }

  const cached = getUserCache().get("session:" + sessionToken);
  if (cached) {
    const cachedUser = JSON.parse(cached);
    if (new Date(cachedUser.session_expires_at).getTime() >= Date.now()) {
      return cachedUser;
    }
    removeCachedSession(sessionToken);
  }

  const users = readRows("users");
  const user = users.find(function (item) {
    return item.session_token === sessionToken;
  });

  if (!user) {
    throw new Error("Invalid session");
  }

  if (!user.session_expires_at || new Date(user.session_expires_at).getTime() < Date.now()) {
    throw new Error("Session expired");
  }

  cacheSessionUser(user);
  return user;
}

function registerUser(body) {
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");

  if (!email) {
    return { ok: false, error: "Vui lòng nhập email" };
  }

  if (password.length < 6) {
    return { ok: false, error: "Mật khẩu phải có ít nhất 6 ký tự" };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const users = readRows("users");
    if (users.some(function (user) { return user.email === email; })) {
      return { ok: false, error: "Email đã tồn tại" };
    }

    const salt = makeToken();
    const token = makeToken();
    const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const user = {
      id: Utilities.getUuid(),
      email: email,
      password_hash: hashPassword(password, salt),
      salt: salt,
      session_token: token,
      session_expires_at: expires,
      created_at: nowIso()
    };

    appendRow("users", user);
    return { ok: true, token: token, user: publicUser(user) };
  } finally {
    lock.releaseLock();
  }
}

function loginUser(body) {
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const users = readRows("users");
  const user = users.find(function (item) {
    return item.email === email;
  });

  if (!user || user.password_hash !== hashPassword(password, user.salt)) {
    return { ok: false, error: "Email hoặc mật khẩu không đúng" };
  }

  const token = makeToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  updateRow("users", user._row, {
    session_token: token,
    session_expires_at: expires
  });

  user.session_token = token;
  user.session_expires_at = expires;
  cacheSessionUser(user);

  return { ok: true, token: token, user: publicUser(user) };
}

function getCurrentUser(body) {
  const user = requireUser(body.token);
  return { ok: true, user: publicUser(user) };
}

function logoutUser(body) {
  const user = requireUser(body.token);
  removeCachedSession(body.token);
  updateRow("users", user._row, {
    session_token: "",
    session_expires_at: ""
  });
  return { ok: true };
}

function changePassword(body) {
  const user = requireUser(body.token);
  const password = String(body.password || "");

  if (password.length < 6) {
    return { ok: false, error: "Mật khẩu phải có ít nhất 6 ký tự" };
  }

  const salt = makeToken();
  updateRow("users", user._row, {
    salt: salt,
    password_hash: hashPassword(password, salt)
  });

  return { ok: true };
}

function forgotPassword(body) {
  const email = normalizeEmail(body.email);
  const resetBaseUrl = String(body.resetBaseUrl || "");
  const users = readRows("users");
  const user = users.find(function (item) {
    return item.email === email;
  });

  if (!user) {
    return { ok: true };
  }

  const token = makeToken();
  appendRow("password_resets", {
    id: Utilities.getUuid(),
    user_id: user.id,
    token: token,
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    used: "false",
    created_at: nowIso()
  });

  const link = resetBaseUrl + "?token=" + encodeURIComponent(token);
  MailApp.sendEmail({
    to: user.email,
    subject: "VocaNest - Đặt lại mật khẩu",
    body: "Mở liên kết này để đặt lại mật khẩu VocaNest:\n\n" + link + "\n\nLiên kết hết hạn sau 1 giờ."
  });

  return { ok: true };
}

function resetPassword(body) {
  const token = String(body.resetToken || "");
  const password = String(body.password || "");

  if (password.length < 6) {
    return { ok: false, error: "Mật khẩu phải có ít nhất 6 ký tự" };
  }

  const resets = readRows("password_resets");
  const reset = resets.find(function (item) {
    return item.token === token && !toBool(item.used);
  });

  if (!reset || new Date(reset.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" };
  }

  const users = readRows("users");
  const user = users.find(function (item) {
    return item.id === reset.user_id;
  });

  if (!user) {
    return { ok: false, error: "Không tìm thấy tài khoản" };
  }

  const salt = makeToken();
  removeCachedSession(user.session_token);
  updateRow("users", user._row, {
    salt: salt,
    password_hash: hashPassword(password, salt),
    session_token: "",
    session_expires_at: ""
  });
  updateRow("password_resets", reset._row, { used: "true" });

  return { ok: true };
}

function listSets(body) {
  const user = requireUser(body.token);
  const sets = readRows("vocab_sets");
  const items = readRows("vocab_items");
  const users = readRows("users");
  const itemCounts = {};
  const userEmails = {};

  items.forEach(function (item) {
    itemCounts[item.vocab_set_id] = (itemCounts[item.vocab_set_id] || 0) + 1;
  });

  users.forEach(function (item) {
    userEmails[item.id] = item.email;
  });

  const data = sets
    .filter(function (set) {
      return set.user_id === user.id || toBool(set.is_public);
    })
    .map(function (set) {
      return {
        id: set.id,
        user_id: set.user_id,
        title: set.title,
        description: set.description,
        is_public: toBool(set.is_public),
        created_at: set.created_at,
        creator_email: userEmails[set.user_id] || "",
        word_count: itemCounts[set.id] || 0
      };
    })
    .sort(function (a, b) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return { ok: true, data: data };
}

function getSet(body) {
  const user = requireUser(body.token);
  const set = readRows("vocab_sets").find(function (item) {
    return item.id === String(body.setId || "");
  });

  if (!set) {
    return { ok: false, error: "Không tìm thấy bộ từ vựng" };
  }

  const isOwner = set.user_id === user.id;
  if (!isOwner && !toBool(set.is_public)) {
    return { ok: false, error: "Bộ này là riêng tư" };
  }

  return {
    ok: true,
    data: {
      id: set.id,
      user_id: set.user_id,
      title: set.title,
      description: set.description,
      is_public: toBool(set.is_public),
      created_at: set.created_at,
      is_owner: isOwner
    }
  };
}

function getSetBundle(body) {
  const user = requireUser(body.token);
  const setId = String(body.setId || "");
  const set = readRows("vocab_sets").find(function (item) {
    return item.id === setId;
  });

  if (!set) {
    return { ok: false, error: "Không tìm thấy bộ từ vựng" };
  }

  const isOwner = set.user_id === user.id;
  if (!isOwner && !toBool(set.is_public)) {
    return { ok: false, error: "Bạn không có quyền xem bộ này" };
  }

  const items = readRows("vocab_items")
    .filter(function (item) {
      return item.vocab_set_id === setId;
    })
    .map(function (item) {
      return {
        id: item.id,
        vocab_set_id: item.vocab_set_id,
        user_id: item.user_id,
        word: item.word,
        meaning: item.meaning,
        created_at: item.created_at
      };
    })
    .sort(function (a, b) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return {
    ok: true,
    data: {
      set: {
        id: set.id,
        user_id: set.user_id,
        title: set.title,
        description: set.description,
        is_public: toBool(set.is_public),
        created_at: set.created_at,
        is_owner: isOwner
      },
      items: items
    }
  };
}

function createSet(body) {
  const user = requireUser(body.token);
  const title = String(body.title || "").trim();

  if (!title) {
    return { ok: false, error: "Vui lòng nhập tên bộ từ vựng" };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const id = Utilities.getUuid();
    const set = {
      id: id,
      user_id: user.id,
      title: title,
      description: String(body.description || "").trim(),
      is_public: toBool(body.isPublic) ? "true" : "false",
      created_at: nowIso()
    };

    appendRow("vocab_sets", set);
    return {
      ok: true,
      id: id,
      data: {
        id: set.id,
        user_id: set.user_id,
        title: set.title,
        description: set.description,
        is_public: toBool(set.is_public),
        created_at: set.created_at,
        creator_email: user.email,
        word_count: 0
      }
    };
  } finally {
    lock.releaseLock();
  }
}

function deleteSet(body) {
  const user = requireUser(body.token);
  const setId = String(body.setId || "");
  const sets = readRows("vocab_sets");
  const set = sets.find(function (item) {
    return item.id === setId;
  });

  if (!set || set.user_id !== user.id) {
    return { ok: false, error: "Bạn không có quyền xoá bộ này" };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const remainingItems = readRows("vocab_items").filter(function (item) {
      return item.vocab_set_id !== setId;
    });

    replaceRows("vocab_items", remainingItems);
    deleteRow("vocab_sets", set._row);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function listItems(body) {
  const user = requireUser(body.token);
  const setId = String(body.setId || "");
  const set = readRows("vocab_sets").find(function (item) {
    return item.id === setId;
  });

  if (!set) {
    return { ok: false, error: "Không tìm thấy bộ từ vựng" };
  }

  if (set.user_id !== user.id && !toBool(set.is_public)) {
    return { ok: false, error: "Bạn không có quyền xem bộ này" };
  }

  const data = readRows("vocab_items")
    .filter(function (item) { return item.vocab_set_id === setId; })
    .map(function (item) {
      return {
        id: item.id,
        vocab_set_id: item.vocab_set_id,
        user_id: item.user_id,
        word: item.word,
        meaning: item.meaning,
        created_at: item.created_at
      };
    })
    .sort(function (a, b) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return { ok: true, data: data };
}

function addItem(body) {
  const user = requireUser(body.token);
  const setId = String(body.setId || "");
  const word = String(body.word || "").trim();
  const meaning = String(body.meaning || "").trim();

  if (!word || !meaning) {
    return { ok: false, error: "Nhập đủ từ và nghĩa" };
  }

  assertOwnSet(user.id, setId);

  const item = {
    id: Utilities.getUuid(),
    vocab_set_id: setId,
    user_id: user.id,
    word: word,
    meaning: meaning,
    created_at: nowIso()
  };

  appendRow("vocab_items", item);
  return { ok: true, data: item };
}

function importItems(body) {
  const user = requireUser(body.token);
  const setId = String(body.setId || "");
  const items = Array.isArray(body.items) ? body.items : [];

  assertOwnSet(user.id, setId);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const createdItems = [];

    items.forEach(function (item) {
      const word = String(item.word || "").trim();
      const meaning = String(item.meaning || "").trim();
      if (!word || !meaning) return;

      createdItems.push({
        id: Utilities.getUuid(),
        vocab_set_id: setId,
        user_id: user.id,
        word: word,
        meaning: meaning,
        created_at: nowIso()
      });
    });

    appendRows("vocab_items", createdItems);
    return { ok: true, count: createdItems.length, data: createdItems };
  } finally {
    lock.releaseLock();
  }
}

function deleteItem(body) {
  const user = requireUser(body.token);
  const itemId = String(body.itemId || "");
  const items = readRows("vocab_items");
  const item = items.find(function (row) {
    return row.id === itemId;
  });

  if (!item) {
    return { ok: false, error: "Không tìm thấy từ vựng" };
  }

  assertOwnSet(user.id, item.vocab_set_id);
  deleteRow("vocab_items", item._row);
  return { ok: true };
}

function assertOwnSet(userId, setId) {
  const set = readRows("vocab_sets").find(function (item) {
    return item.id === setId;
  });

  if (!set || set.user_id !== userId) {
    throw new Error("Bạn không có quyền chỉnh sửa bộ này");
  }
}
