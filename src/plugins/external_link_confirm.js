function init() {
    var css_link = document.createElement('link');
    css_link.rel = 'stylesheet';
    css_link.href = 'src/data/style/external_link_confirm.css';
    document.head.appendChild(css_link);
    styleInfo("[Plugins] External Link Confirm:", "Resources initialized", '#98f3d8', "auto");
}

function closeConfirmDialog() {
    const dialog_wrapper = document.querySelector(".external_link_dialog_wrapper");
    const dialog_mask = document.querySelector(".external_link_dialog_mask");
    if (dialog_wrapper && dialog_mask) {
        dialog_wrapper.style.animation = "fadeOut 0.9s ease";
        dialog_mask.style.animation = "fadeOut 0.9s ease";
        setTimeout(() => {
            dialog_wrapper.remove();
            dialog_mask.remove();
        }, 800);
    }
}

function getSecurityHints(url) {
    try {
        const linkUrl = new URL(url);
        const protocol = linkUrl.protocol;
        const isSecure = protocol === 'https:';
        
        return {
            isSecure: isSecure,
            protocol: protocol.replace(':', '').toUpperCase(),
            hint: isSecure ? '✓ Secure connection' : '⚠ Insecure connection'
        };
    } catch (e) {
        return {
            isSecure: false,
            protocol: 'UNKNOWN',
            hint: '⚠ Unable to verify'
        };
    }
}

function showConfirmDialog(url) {
    const dialog_mask = document.createElement("div");
    const dialog_wrapper = document.createElement("div");
    const dialog_title = document.createElement("div");
    const dialog_message = document.createElement("div");
    const dialog_url = document.createElement("div");
    const dialog_security = document.createElement("div");
    const dialog_buttons = document.createElement("div");
    const btn_confirm = document.createElement("button");
    const btn_cancel = document.createElement("button");
    const dialog_close = document.createElement("div");

    dialog_mask.className = "external_link_dialog_mask";
    dialog_wrapper.className = "external_link_dialog_wrapper";
    dialog_title.className = "external_link_dialog_title";
    dialog_message.className = "external_link_dialog_message";
    dialog_url.className = "external_link_dialog_url";
    dialog_security.className = "external_link_dialog_security";
    dialog_buttons.className = "external_link_dialog_buttons";
    btn_confirm.className = "external_link_dialog_btn external_link_dialog_btn_confirm";
    btn_cancel.className = "external_link_dialog_btn external_link_dialog_btn_cancel";
    dialog_close.className = "external_link_dialog_close";

    const securityInfo = getSecurityHints(url);
    
    dialog_title.innerText = "Open External Link";
    dialog_message.innerText = "You are about to leave this website. Are you sure you want to continue?";
    dialog_url.innerText = url;
    dialog_security.innerText = `${securityInfo.hint} (${securityInfo.protocol})`;
    dialog_security.className = securityInfo.isSecure ? "external_link_dialog_security secure" : "external_link_dialog_security insecure";
    btn_confirm.innerText = "Continue";
    btn_cancel.innerText = "Cancel";
    dialog_close.innerHTML = '<span class="material-symbols-outlined">close</span>';

    btn_confirm.onclick = () => {
        window.skipExternalLinkCheck = true;
        window.open(url, "_blank");
        window.skipExternalLinkCheck = false;
        closeConfirmDialog();
    };

    btn_cancel.onclick = () => {
        closeConfirmDialog();
    };

    dialog_close.onclick = () => {
        closeConfirmDialog();
    };

    dialog_buttons.appendChild(btn_confirm);
    dialog_buttons.appendChild(btn_cancel);

    dialog_wrapper.appendChild(dialog_title);
    dialog_wrapper.appendChild(dialog_message);
    dialog_wrapper.appendChild(dialog_url);
    dialog_wrapper.appendChild(dialog_security);
    dialog_wrapper.appendChild(dialog_buttons);
    dialog_wrapper.appendChild(dialog_close);

    document.body.appendChild(dialog_mask);
    document.body.appendChild(dialog_wrapper);

    dialog_wrapper.style.animation = "confirmDialogIn 0.5s ease";
}

function isExternalLink(url) {
    try {
        const linkUrl = new URL(url, window.location.href);
        const currentUrl = new URL(window.location.href);
        return linkUrl.hostname !== currentUrl.hostname;
    } catch (e) {
        return false;
    }
}

function attachExternalLinkListeners() {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && isExternalLink(href) && !link.getAttribute('data-external-confirm')) {
            link.setAttribute('data-external-confirm', 'true');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showConfirmDialog(href);
                return false;
            });
        }
    });
}

// Wrap window.open to intercept external link opens from onclick events
const originalWindowOpen = window.open;
window.open = function(url, target, features) {
    if (!window.skipExternalLinkCheck && url && isExternalLink(url)) {
        showConfirmDialog(url);
        return null;
    }
    return originalWindowOpen.call(this, url, target, features);
};

init();

// Attach listeners to existing links
attachExternalLinkListeners();

// Use MutationObserver to handle dynamically added links
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            attachExternalLinkListeners();
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
