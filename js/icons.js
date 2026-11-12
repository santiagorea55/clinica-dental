// Iconos de línea (SVG inline, heredan el color del texto). Uso: ic('tooth',32)
const T="M6 3C3.5 3 2.5 6 3.5 9c.8 2.5 1.5 4 1.8 7 .2 2 1 4 2.2 4 1.3 0 1.4-3 2.5-3s1.2 3 2.5 3c1.2 0 2-2 2.2-4 .3-3 1-4.5 1.8-7C17.5 6 16.5 3 14 3c-1.7 0-2.2.8-4 .8S7.7 3 6 3z";
const ICONS={tooth:`<g transform="translate(2 0)"><path d="${T}"/></g>`,
implant:'<path d="M7 3h10v5H7zM9 8v2M15 8v2M8.5 11h7M9 14h6M9.5 17h5M11 20h2"/>',
sparkle:`<g transform="translate(0 2) scale(.85)"><path d="${T}"/></g><path d="M19 2v5M16.5 4.5h5"/>`,
braces:'<path d="M3 8h18v8H3zM3 12h18M8 10v4M12 10v4M16 10v4"/>',
gum:`<g transform="translate(2 -2) scale(.9)"><path d="${T}"/></g><path d="M2 21c3-2 7-2 10 0s7 2 10 0"/>`,
magnify:`<g transform="translate(0 0) scale(.85)"><path d="${T}"/></g><circle cx="17" cy="17" r="3.5"/><path d="M19.6 19.6L22 22"/>`,
denture:'<path d="M3 10c3-4 15-4 18 0v3c-2 3-4 4-9 4s-7-1-9-4zM7 13v3M10 13v4M14 13v4M17 13v3"/>',
tools:'<path d="M7 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM7 9v12M14 3v4M18 3v4M16 3v7M16 10v11"/>',
smile:'<path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 14c1 2 2.5 3 4 3s3-1 4-3M9 10h.01M15 10h.01"/>',
cap:'<path d="M2 9l10-5 10 5-10 5zM6 11v5c3 3 9 3 12 0v-5"/>',
cert:'<path d="M5 3h14v14H5zM8 7h8M8 10h6M14 21l-2-3-2 3v-4h4z"/>',
pin:'<path d="M12 21s-7-6-7-11a7 7 0 1 1 14 0c0 5-7 11-7 11zM12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/>',
calendar:'<path d="M4 6h16v15H4zM4 10h16M8 3v4M16 3v4M8 14h2M12 14h2M16 14h2M8 17h2M12 17h2"/>',
shield:'<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6zM8.5 12l2.5 2.5L16 9.5"/>',
users:'<path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-4 3-6 6-6s6 2 6 6M17 10a2.5 2.5 0 1 0 0-5M17 14c3 0 4.5 2 4.5 5"/>',
chat:'<path d="M4 5h16v11H10l-5 4v-4H4zM8 9h8M8 12h5"/>',chart:'<path d="M4 20h16M6 16v-4M11 16V8M16 16v-6M3 10l5-4 5 3 6-6"/>',
phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4c0 1-1 2-2 2C10 21 3 14 3 6c0-1 1-2 2-2z"/>',
mail:'<path d="M3 5h18v14H3zM3 6l9 7 9-7"/>',clock:'<path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2"/>',
mic:'<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"/>',
send:'<path d="M3 11l18-8-8 18-2-8z"/>',sound:'<path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
mute:'<path d="M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6"/>',check:'<path d="M5 12l5 5L19 7"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
fb:'<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>',
ig:'<path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM17.5 6.5h.01"/>',
yt:'<path d="M3 7c0-1 1-2 2-2h14c1 0 2 1 2 2v10c0 1-1 2-2 2H5c-1 0-2-1-2-2zM10 9v6l5-3z"/>',
wa:'<path d="M3 21l1.5-5A8 8 0 1 1 8 19.5zM9 9c0 3 3 6 6 6l1-2-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z"/>'};
const ic=(n,s=24)=>`<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]||ICONS.tooth}</svg>`;
if(typeof module!=='undefined')module.exports=ICONS;
