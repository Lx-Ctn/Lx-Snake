const rootCSSStyles = getComputedStyle(document.documentElement);

export default {
    green: rootCSSStyles.getPropertyValue("--green"),
    red: rootCSSStyles.getPropertyValue("--red"),
    oldWhite: rootCSSStyles.getPropertyValue("--oldWhite"),
};
