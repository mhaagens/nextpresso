const delay = ms => new Promise(res => setTimeout(res, ms));
const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

export {
    delay,
    capitalize
}