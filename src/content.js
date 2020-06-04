var prefixHeader = 6;
var port;
var cookieName = null;
var tabId;
try {
    port = chrome.runtime.connect({
        name: "3"
    });
    port.onMessage.addListener(function (props) {
        if (4 == props.type) {
            if ("undefined" == props.profile) {
                window.location.reload();
            }
            initTabId(props.profile);
        }
    });
    port.postMessage({
        type: "3"
    });
    port.onDisconnect.addListener(function () {});
} catch (q) {}
if (!port) {
    throw "port not found";
}

/**
 * get current unix time
 * @returns {number}
 */
function getCurrentTime() {
    var date = new Date();
    return date.getTime();
}

watchCookie();

/**
 * @return {undefined}
 */
function watchTitle() {
    var content;
    /** @type {string} */
    content = "(" + function () {
        var ____t = document.title;
        var ce = CustomEvent;
        document.__defineSetter__("title", function (t) {
            ____t = t;
            var e = new ce("9", {
                "detail": t
            });
            document.dispatchEvent(e)
        });
        document.__defineGetter__("title", function () {
            return ____t
        });
    } + ")()";
    var script = document.createElement("script");
    script.appendChild(document.createTextNode(content));
    (document.head || document.documentElement).appendChild(script);
    script.parentNode.removeChild(script);
}

/**
 * include js to page
 * @return {undefined}
 */
function watchCookie() {
    var content;
    /**
     * @return {undefined}
     */
    content = function () {};
    content = "(" + function () {
        var ce = CustomEvent;
        document.__defineSetter__("cookie", function (c) {
            var event = new ce("7", {
                "detail": c
            });
            document.dispatchEvent(event)
        });
        document.__defineGetter__("cookie", function () {
            var event = new ce("8");
            document.dispatchEvent(event);
            var c;
            try {
                c = localStorage.getItem("@@@cookies");
                localStorage.removeItem("@@@cookies")
            } catch (e) {
                c = document.getElementById("@@@cookies").innerText
            }
            return c
        })
    } + ")();";
    var script = document.createElement("script");
    script.appendChild(document.createTextNode(content));
    (document.head || document.documentElement).appendChild(script);
    script.parentNode.removeChild(script);

}

/**
 * @param {Object} s
 * @return {undefined}
 */
function initTabId(s) {
    if (null !== s) {
        cookieName = s;
        tabId = cookieName.substr(0, cookieName.indexOf("_@@@_"));
    }
}

/**
 * @return {undefined}
 */
function init() {
    if (null === cookieName) {
        var xhr = new XMLHttpRequest;
        xhr.open("GET", "https://translate.googleapis.com/translate_static/img/loading.gif", false);
        xhr.send();
        var prefix = xhr.getResponseHeader(prefixHeader);
        if (null !== prefix) {
            initTabId(prefix);
        }
    }
}

document.addEventListener(7, function (e) {
    e = e.detail;
    init();
    document.cookie = null === cookieName ? e : cookieName + e.trim();
});

document.addEventListener(8, function () {
    init();
    var value;
    var cookie = document.cookie;
    value = "";
    if (cookie) {
        cookie = cookie.split("; ");
        var d;
        for (d in cookie) {
            if (cookieName) {
                if (cookie[d].substring(0, cookieName.length) != cookieName) {
                    continue;
                }
            } else {
                if (-1 < cookie[d].indexOf("_@@@_")) {
                    continue;
                }
            }
            if (value) {
                value += "; ";
            }
            value += cookieName ? cookie[d].substring(cookieName.length) : cookie[d];
        }
    }
    try {
        localStorage.setItem("@@@cookies", value);
    } catch (v) {
        if (!document.getElementById("@@@cookies")) {
            d = document.createElement("div");
            d.setAttribute("id", "@@@cookies");
            document.documentElement.appendChild(d);
            d.style.display = "none";
        }
        document.getElementById("@@@cookies").a = value;
    }
});

document.addEventListener(9, function (e) {
    changeTitle(e.detail);
});

/**
 * @param {string} title
 * @return {undefined}
 */
function changeTitle(title) {
    if (tabId) {
        if (title.substr(0, tabId.length + 2) != "[" + tabId + "]") {
            document.title = title + " [" + tabId + "]";
        }
    } else {
        document.title = title;
    }
}

chrome.runtime.onMessage.addListener(function (statement) {
    if (5 == statement.type) {
        watchTitle();
        changeTitle(document.title);
    }
    if ("3" == statement.type) {
        initTabId("");
        document.title = document.title.replace(/\s*\[\d*\]\s*/g, "");
    }
});

window.addEventListener("message", function (e) {
    if (e.data && e.data.type == 'open-new-tab') {
        port.postMessage({
            type: "9",
            options: {
                pageUrl: e.data.pageUrl
            }
        });
    }
}, false);

/**
 * @return {undefined}
 */
window.onunload = function () {
    /** @type {string} */
    document.title = document.title.replace(/\s*\[\d*\]\s*/g, "");
};