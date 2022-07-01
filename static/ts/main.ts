import colorScheme from "./colorscheme.js";

colorScheme();

const form: HTMLFormElement | null = document.querySelector("#form");
const fileInput: HTMLInputElement | null = document.querySelector("#files");
const alertContainer: HTMLSpanElement | null =
    document.querySelector("#alertContainer");
const alertMessage: HTMLSpanElement | null =
    document.querySelector("#alertMessage");

form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    const response = await fetch("/", {
        method: "post",
        body: formData,
    });
    const json = await response.json();

    if (fileInput) {
        fileInput.value = "";
    }

    if (alertMessage && alertContainer) {
        if (json.success) {
            alertMessage.textContent = "File(s) uploaded successfully!";
        } else {
            alertMessage.textContent = "File upload failed!";
        }
        alertContainer.classList.remove("d-none");
        setTimeout(() => {
            alertContainer.classList.add("d-none");
            alertMessage.textContent = null;
        }, 5000);
    }
});
