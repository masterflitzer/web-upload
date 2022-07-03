import colorScheme from "./colorscheme.js";

colorScheme();

const form: HTMLFormElement | null = document.querySelector("#form");
const fileInput: HTMLInputElement | null = document.querySelector("#files");
const submitButton: HTMLButtonElement | null =
    document.querySelector("#submit");
const alertContainer: HTMLSpanElement | null =
    document.querySelector("#alertContainer");
const alertMessage: HTMLSpanElement | null =
    document.querySelector("#alertMessage");

function toggleChildrenDisplay(element: Element, display: boolean) {
    Array.from(element.children).forEach((e) => {
        try {
            const html = e as HTMLElement;
            html.style.display = display ? "" : "none";
        } catch (error) {
            console.warn(error);
        }
    });
}

form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (
        fileInput == null ||
        submitButton == null ||
        alertMessage == null ||
        alertContainer == null
    ) {
        console.error("Couldn't find necessary elements");
        return;
    }

    const animation = document.createElement("div");
    animation.classList.add("dots-animation");
    for (let i = 0; i < 3; i++) {
        animation.append(document.createElement("span"));
    }

    toggleChildrenDisplay(submitButton, false);
    submitButton.append(animation);

    const formData = new FormData(form);
    const response = await fetch(globalThis.location.href, {
        method: "post",
        body: formData,
    });

    const status = response.status.toString();
    if (status.startsWith("4") || status.startsWith("5")) {
        alertMessage.textContent = "An unexpected error occurred!";
    } else {
        const json = await response.json();

        if (json.success) {
            alertMessage.textContent = "File(s) uploaded successfully!";
        } else {
            alertMessage.textContent = "File upload failed!";
        }
    }

    fileInput.value = "";
    fileInput.focus();

    animation.remove();
    toggleChildrenDisplay(submitButton, true);

    alertContainer.classList.remove("d-none");
    setTimeout(() => {
        alertContainer.classList.add("d-none");
        alertMessage.textContent = null;
    }, 5000);
});
