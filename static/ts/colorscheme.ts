const body = document.body;
const classesLight = ["bg-white", "text-dark"];
const classesDark = ["bg-black", "text-light"];

const mediaLight = globalThis.matchMedia("(prefers-color-scheme: light)");
const mediaDark = globalThis.matchMedia("(prefers-color-scheme: dark)");

const setLightMode = (e: Element) =>
    manipulateCssClasses(e, classesLight, classesDark);
const setDarkMode = (e: Element) =>
    manipulateCssClasses(e, classesDark, classesLight);

function setColorScheme(e: Element) {
    if (mediaLight.matches) setLightMode(e);
    else if (mediaDark.matches) setDarkMode(e);
    else manipulateCssClasses(e, [], [...classesLight, ...classesDark]);
    classesColorScheme();
}

function dynamicColorScheme(e: Element) {
    [mediaLight, mediaDark].forEach((media) =>
        media.addEventListener("change", (event) => {
            if (event.matches) {
                setColorScheme(e);
                classesColorScheme();
            }
        })
    );
}

function manipulateCssClasses(
    e: Element,
    add: string | string[],
    remove: string | string[]
) {
    if (!Array.isArray(add)) add = Array.from(add);
    if (!Array.isArray(remove)) remove = Array.from(remove);
    e.classList.add(...add);
    e.classList.remove(...remove);
}

function classesColorScheme() {
    const classes = [
        "alert-light",
        "alert-dark",
        "btn-light",
        "btn-dark",
        "btn-outline-light",
        "btn-outline-dark",
    ];
    const elements = Array.from(
        document.querySelectorAll(classes.map((c) => `.${c}`).join(", "))
    );
    if (mediaLight.matches) {
        elements.forEach((e) => {
            e.classList.replace("alert-dark", "alert-light");
            e.classList.replace("btn-dark", "btn-light");
            e.classList.replace("btn-outline-dark", "btn-outline-light");
        });
    } else if (mediaDark.matches) {
        elements.forEach((e) => {
            e.classList.replace("alert-light", "alert-dark");
            e.classList.replace("btn-light", "btn-dark");
            e.classList.replace("btn-outline-light", "btn-outline-dark");
        });
    }
}

export default function main() {
    if (!globalThis.matchMedia) return;
    setColorScheme(body);
    dynamicColorScheme(body);
}
