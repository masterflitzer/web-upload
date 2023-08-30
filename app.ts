import { mkdir, rename, rm } from "node:fs/promises";

import config from "./config.json" assert { type: "json" };
import Koa, { Context, Next } from "koa";
import Multer from "@koa/multer";
import Router from "@koa/router";
import send from "koa-send";

function getDirname(url: string) {
    let path = new URL(url).pathname;
    path = path.replace(/^[/]([A-Z]:)/, "$1");
    path = path.replace(/[/][^/]+$/, "");
    return path;
}

function normalizeFileName(fileName: string) {
    return fileName.replaceAll(/[^0-9a-zA-Z-.]/g, "-").toLowerCase();
}

const maxUploadFileSize = config.maxUploadFileSize; // in bytes

const dirname = getDirname(import.meta.url);
const dir = {
    tmp: `${dirname}/tmp`,
    upload: `${dirname}/uploads`,
};

await rm(dir.tmp, { force: true, recursive: true });
Object.values(dir).forEach(async (x) => await mkdir(x, { recursive: true }));

const router = new Router();

const upload = Multer({
    dest: dir.tmp,
    limits: {
        fileSize: maxUploadFileSize,
    },
});

router.post("/", upload.any(), async (ctx: Context) => {
    if (!ctx.is("multipart/form-data")) {
        ctx.status = 415;
        ctx.body = {
            success: false,
        };
        return;
    }

    if (ctx.files == null || ctx.files.length === 0) {
        ctx.status = 400;
        ctx.body = {
            success: false,
        };
        return;
    }

    for (const file of ctx.request.files as Multer.File[]) {
        if (file.filename != null) {
            const normalizedName = normalizeFileName(file.originalname);
            await rename(
                `${dir.tmp}/${file.filename}`,
                `${dir.upload}/${normalizedName}`
            );
            console.info(`Uploaded ${file.originalname} -> ${normalizedName}`);
        }
    }
    ctx.status = 201;
    ctx.body = {
        success: true,
    };
});

const app = new Koa();

app.use(async (ctx: Context, next: Next) => {
    try {
        await next();
    } catch (error) {
        console.error(error);
        ctx.status = 500;
        ctx.body = "Internal Server Error";
        return;
    }
});

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx: Context) => {
    await send(ctx, ctx.path, {
        root: `${dirname}/static`,
        index: "index.html",
    });
});

const host = config.host ?? "localhost";
const port = config.port ?? 8080;

app.listen(port, host, () =>
    console.info(`Listening on http://${host}:${port}`)
);
