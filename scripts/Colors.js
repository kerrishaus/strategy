import { getRandomInt } from "https://kerrishaus.com/assets/scripts/MathUtility.js";

export const unownedColor               = "#696969",
             unownedHoverColor          = "#734D40",
             unownedSelectColor         = "#8f6253";

// https://stackoverflow.com/a/60880664/6745382
// TODO: maybe cache results? not sure that this is that big of a performance hit though
export function shade(hexInput, percent)
{
    if (percent === undefined)
    {
        console.error("Percent is undefined!");
        return "#000000";
    }

    let hex = hexInput;

    // strip the leading # if it's there
    hex = hex.replace(/^\s*#|\s*$/g, "");

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if (hex.length === 3)
        hex = hex.replace(/(.)/g, "$1$1");

    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);

    r = Math.min(255, Math.max(0, Math.round(r + percent)));
    g = Math.min(255, Math.max(0, Math.round(g + percent)));
    b = Math.min(255, Math.max(0, Math.round(b + percent)));

    return `#${r.toString(16).toUpperCase().padStart(2, 0)}${g.toString(16).toUpperCase().padStart(2, 0)}${b.toString(16).toUpperCase().padStart(2, 0)}`;
}

export function randomHex()
{
    let r = getRandomInt(255).toString(16).toUpperCase().padStart(2, 0);
    let g = getRandomInt(255).toString(16).toUpperCase().padStart(2, 0);
    let b = getRandomInt(255).toString(16).toUpperCase().padStart(2, 0);

    return `#${r}${g}${b}`;
}