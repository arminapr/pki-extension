function valueIsLikePassword(value) {
    if (!value) {
        return false;
    }

    const cleanedValue = value.toLowerCase().replace(/[\s_\-]/g, "");

    if (cleanedValue.indexOf("password") < 0) {
        return false;
    }

    if (AutoFillConstants && AutoFillConstants.PasswordFieldIgnoreList.some((i) => cleanedValue.indexOf(i) > -1)) {
        return false;
    }

    return true;
}

function isLikePassword(field) {
    if (field.type !== "text") {
        return false;
    }
    if (valueIsLikePassword(field.htmlID)) {
        return true;
    }
    if (valueIsLikePassword(field.htmlName)) {
        return true;
    }
    if (valueIsLikePassword(field.placeholder)) {
        return true;
    }
    return false;
}

function detectPasswordField() {
    const passwordFields = [...document.querySelectorAll('input[type="password"], input[type="text"]')];

    const hasPassword = passwordFields.some(field => {
        return field.type === "password" || isLikePassword(field);
    });

    if (hasPassword) {
        browser.runtime.sendMessage({ hasPassword: true });
    }
}

// Run the function initially
detectPasswordField();

// Mutation observer for DOM changes
const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            detectPasswordField();
        }
    }
});

observer.observe(document, { childList: true, subtree: true });
