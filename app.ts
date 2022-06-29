import {
    Application,
    Router,
    send,
    Status,
} from "https://deno.land/x/oak@v10.4.0/mod.ts";
import { move } from "https://deno.land/std@0.145.0/fs/mod.ts";

function getDirname(url: string) {
    let path = new URL(url).pathname;
    path = path.replace(/^[/]([A-Z]:)/, "$1");
    path = path.replace(/[/][^/]+$/, "");
    return path;
}

const port = 8080;
const maxUploadFileSize = 128000000000; // in bytes

const dirname = getDirname(import.meta.url);
const uploadDir = `${dirname}/uploads`;
const staticDir = `${dirname}/static`;
const tmpDir = `${dirname}/tmp`;

const router = new Router();

router.post("/", async (ctx) => {
    try {
        const body = ctx.request.body();
        if (body.type === "form-data") {
            const destination = uploadDir;
            const formData = await body.value.read({
                maxFileSize: maxUploadFileSize,
                maxSize: 0,
                outPath: tmpDir,
            });
            formData.files?.forEach((file) => {
                if (file.filename != null) {
                    move(file.filename, `${destination}/${file.originalName}`, {
                        overwrite: true,
                    });
                }
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        ctx.response.status = Status.SeeOther;
        ctx.response.redirect("/");
    }
});

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx, next) => {
    try {
        await send(ctx, ctx.request.url.pathname, {
            root: staticDir,
            index: "index.html",
        });
    } catch (e) {
        console.error(e);
    } finally {
        await next();
    }
});

app.addEventListener("listen", ({ secure, hostname, port }) => {
    const protocol = secure ? "https" : "http";
    const host = hostname === "0.0.0.0" ? "localhost" : hostname ?? "localhost";
    console.info(`Listening on ${protocol}://${host}:${port}`);
});

await app.listen({ port });
