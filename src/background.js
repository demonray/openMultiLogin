var hasAddPrefix = {};
var tabPrefix = [];
var tabMutilogin = [];
clearCookie("");

chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.create({}, function (props) {
        savePrefix(props.id, props.id + "_@@@_");
    });
});

/**
 * @param {string} value
 * @return {undefined}
 */
function clearCookie(value) {
    chrome.cookies.getAll({}, function (map) {
        var letter;
        for (letter in map) {
            var m = map[letter];
            var name = m.name;
            if (!(null === value && 0 < name.indexOf("@@@"))) {
                if (!("" === value && -1 == name.indexOf("@@@"))) {
                    if (!(value && name.substring(0, value.length) != value)) {
                        chrome.cookies.remove({
                            url: (m.secure ? "https://" : "http://") + m.domain + m.path,
                            name: name
                        }, function () {});
                    }
                }
            }
        }
    });
}

/**
 * @return {undefined}
 */
function z() {
    chrome.cookies.getAll({}, function (attrs) {
        var key;
        for (key in attrs) {
            var val = attrs[key].name;
            if (0 <= val.indexOf("_@@@_")) {
                for (key in val = val.substr(0, val.indexOf("_@@@_")) + "_@@@_", tabPrefix) {
                    if (tabPrefix[key] == val) {
                        return;
                    }
                }
            }
        }
    });
}

chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
    var c = getCookiePrefix(removedTabId);
    savePrefix(addedTabId, c);
    delete tabPrefix[removedTabId];
    setBadge(addedTabId, c);
});

chrome.tabs.onRemoved.addListener(function (tabId) {
    a: {
        var val = getCookiePrefix(tabId);
        if (val) {
            delete tabPrefix[tabId];
            var key;
            for (key in tabPrefix) {
                if (tabPrefix[key] == val) {
                    break a;
                }
            }
            clearCookie(val);
        }
    }
    delete tabMutilogin[tabId];
});

chrome.tabs.onUpdated.addListener(function (tabId, dataAndEvents, jqXHR) {
    if ("loading" == jqXHR.status) {
        savePrefix(tabId, getCookiePrefix(tabId));
    }
});

chrome.tabs.onCreated.addListener(function (tab) {
    if (tab) {
        var i = tab.id;
        if (i && !(0 > i)) {
            if (!tab.openerTabId) {
                var cl = tab.windowId;
                if (Cur && (activeTabId && Cur != cl)) {

                    cl = getCookiePrefix(activeTabId);
                    savePrefix(i, cl);
                    tabMutilogin[i] = true;
                    return;
                }
            }

            var url = "";
            if (tab.pendingUrl)
                url = tab.pendingUrl;
            else
                url = tab.url;

            if (tab.openerTabId && "chrome" != url.substr(0, 6)) {
                cl = getCookiePrefix(tab.openerTabId);
                savePrefix(i, cl);
                if ("undefined" === typeof tabMutilogin[i]) {
                    tabMutilogin[i] = tab.openerTabId;
                }
            } else {
                tabMutilogin[i] = true;
            }
        }
    }
});
var Cur;
chrome.windows.getCurrent({}, function (ignores) {
    E(ignores.id);
});
chrome.windows.onFocusChanged.addListener(function (deepDataAndEvents) {
    E(deepDataAndEvents);
});

/**
 * @param {number} deepDataAndEvents
 * @return {undefined}
 */
function E(deepDataAndEvents) {
    if (deepDataAndEvents && deepDataAndEvents > -1) {
        chrome.windows.get(deepDataAndEvents, {}, function (row) {
            if (row) {
                if ("normal" == row.type) {
                    Cur = deepDataAndEvents;
                    chrome.tabs.query({
                        active: true,
                        windowId: Cur
                    }, function (results) {
                        activeTabId = results[0].id;
                    });
                }
            }
        });
    }
}

var activeTabId;
chrome.tabs.onActiveChanged.addListener(function (dataAndEvents, existingTab) {
    E(existingTab.windowId);
});

chrome.webRequest.onBeforeRequest.addListener(function (req) {
    var tabId = req.tabId
    if ((tabId >= 0 && (z(), "undefined" === typeof tabMutilogin[tabId]))) {
        tabId = 0;
        var start = (new Date).getTime();
        for (; 500 > tabId - start; tabId = (new Date).getTime()) {}
    }
}, {
    urls: ["http://*/*", "https://*/*"],
    types: ["main_frame"]
}, ["blocking", "requestBody"]);

chrome.webRequest.onBeforeSendHeaders.addListener(function (data) {
    var key = data.tabId;
    if (key && !(0 > key)) {
        var a = getCookiePrefix(key);
        var url = data.url;
        var headers = data.requestHeaders;
        var c = "";
        if ("https://translate.googleapis.com/translate_static/img/loading.gif" != url.substring(0, 65)) {
            if ("main_frame" == data.type) {
                hasAddPrefix[key] = false;
            }
            for (i in headers) {
                if ("cookie" === headers[i].name.toLowerCase()) {
                    if (!a && -1 == headers[i].value.indexOf("_@@@_")) {
                        return;
                    }
                    data = headers[i].value.split("; ");
                    var k;
                    for (k in data) {
                        key = data[k].trim();
                        if (a) {
                            if (key.substring(0, a.length) != a) {
                                continue;
                            }
                        } else {
                            if (-1 < key.indexOf("_@@@_")) {
                                continue;
                            }
                        }
                        if (0 < c.length) {
                            c += "; ";
                        }
                        c = a ? c + key.substring(a.length) : c + key;
                    }
                    headers.splice(i, 1);
                }
            }
            if (0 < c.length) {
                headers.push({
                    name: "Cookie",
                    value: c
                });
            }
            return {
                requestHeaders: headers
            };
        }
    }
}, {
    urls: ["http://*/*", "https://*/*"]
}, ["blocking", "requestHeaders", "extraHeaders"]);

chrome.webRequest.onHeadersReceived.addListener(function (data) {
    var key = data.tabId;
    if (key > 0) {
        var val = getCookiePrefix(key);
        if ("" != val) {
            var url = data.url;
            data = data.responseHeaders;
            if (!hasAddPrefix[key] && "https://translate.googleapis.com/translate_static/img/loading.gif" != url.substring(0, 65)) {
                var k;
                for (k in data) {
                    if ("set-cookie" == data[k].name.toLowerCase()) {
                        data[k].value = val + data[k].value;
                    }
                }
                return {
                    responseHeaders: data
                };
            }
        }
    }
}, {
    urls: ["http://*/*", "https://*/*"]
}, ["blocking", "responseHeaders", "extraHeaders"]);

chrome.webRequest.onHeadersReceived.addListener(function (details) {
    var tabId = details.tabId;
    if (tabId && tabId >= 0) {
        return details.responseHeaders.push({
            name: "6",
            value: getCookiePrefix(tabId)
        }), {
            responseHeaders: details.responseHeaders
        };
    }
}, {
    urls: ["https://translate.googleapis.com/translate_static/img/loading.gif"]
}, ["blocking", "responseHeaders", "extraHeaders"]);

chrome.webNavigation.onDOMContentLoaded.addListener(function (details) {
    var tabId = details.tabId;
    if (!(!tabId || (0 > tabId || (!getCookiePrefix(tabId) || 0 < details.frameId)))) {
        try {
            chrome.tabs.sendMessage(tabId, {
                type: 5
            });
        } catch (c) {}
    }
}, {
    urls: ["http://*/*", "https://*/*"]
});

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (statement) {
        if (3 == statement.type) {
            if (port.sender.tab) {
                port.postMessage({
                    type: 4,
                    profile: getCookiePrefix(port.sender.tab.id)
                });
            }
        }
        if (9 == statement.type) {
            OpenNewTab(statement.options)
        }
    });
});

/**
 * @param {?} key
 * @return {?}
 */
function getCookiePrefix(key) {
    if (key >= 1) {
        return hasAddPrefix[key] || !tabPrefix[key] ? "" : tabPrefix[key];
    }
}

/**
 * @param {number} tabId
 * @param {string} cookiePrefix
 * @return {undefined}
 */
function savePrefix(tabId, cookiePrefix) {
    if (cookiePrefix) {
        tabPrefix[tabId] = cookiePrefix;
        setBadge(tabId, cookiePrefix);
    }
}

/**
 * @param {number} a
 * @param {string} x
 * @return {undefined}
 */
function setBadge(a, x) {
    if ("undefined" !== typeof x) {
        var expectedSerialization = {
            text: x.substr(0, x.indexOf("_@@@_")),
            tabId: a
        };
        chrome.browserAction.setBadgeBackgroundColor({
            color: "#006600",
            tabId: a
        });
        chrome.browserAction.setBadgeText(expectedSerialization);
    }
}

/**
 * @param {?} e
 * @return {undefined}
 */
function OpenNewTab(e) {
    var file = e.pageUrl;
    if (e.linkUrl) {
        file = e.linkUrl;
    }
    chrome.tabs.create({
        url: file
    }, function (props) {
        savePrefix(props.id, props.id + "_@@@_");
    });
}

chrome.contextMenus.create({
    title: "Duplicate Page in New Identity",
    contexts: ["page", "image"],
    onclick: OpenNewTab
});
chrome.contextMenus.create({
    title: "Open Link in New Identity",
    contexts: ["link"],
    onclick: OpenNewTab
});