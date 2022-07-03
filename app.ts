import {
    Application,
    Router,
    send,
    Status,
} from "https://deno.land/x/oak@v10.4.0/mod.ts";
import {
    emptyDir,
    ensureDir,
    move,
} from "https://deno.land/std@0.145.0/fs/mod.ts";

function getDirname(url: string) {
    let path = new URL(url).pathname;
    path = path.replace(/^[/]([A-Z]:)/, "$1");
    path = path.replace(/[/][^/]+$/, "");
    return path;
}

const port = 8080;
const maxUploadFileSize = 128000000000; // in bytes

const dirname = getDirname(import.meta.url);
const dir = {
    upload: `${dirname}/uploads`,
    static: `${dirname}/static`,
    tmp: `${dirname}/tmp`,
};
Object.values(dir).forEach((x) => ensureDir(x));

const router = new Router();

router.post("/", async (ctx) => {
    let success: boolean | null = null;
    try {
        const body = ctx.request.body();
        if (body.type === "form-data") {
            const destination = dir.upload;
            const formData = await body.value.read({
                maxFileSize: maxUploadFileSize,
                maxSize: 0,
                outPath: dir.tmp,
            });

            if (formData.files == null || formData.files.length === 0)
                throw new Error("No files received");

            for (const file of formData.files) {
                if (file.filename != null) {
                    await move(
                        file.filename,
                        `${destination}/${file.originalName}`,
                        {
                            overwrite: true,
                        }
                    );
                    console.info(`Uploaded ${file.originalName}`);
                }
            }

            success = true;
        }
    } catch (e) {
        console.error(e);
        success = false;
    } finally {
        ctx.response.status = Status.SeeOther;
        ctx.response.body = JSON.stringify({
            success,
        });

        await emptyDir(dir.tmp);
    }
});

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx, next) => {
    try {
        await send(ctx, ctx.request.url.pathname, {
            root: dir.static,
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
