import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import sirv from "sirv";

function customDevServer() {
    return {
        name: 'custom-dev-server',
        hooks: {
            'astro:server:setup': ({ server }) => {

                server.httpServer.on('upgrade', (req, socket, head) => {
                    if (req.url.startsWith("/wisp/")) {
                        wisp.routeRequest(req, socket, head);
                    }
                });

                server.middlewares.use((req, res, next) => {
                    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
                    next();
                });

                server.middlewares.use('/epoxy/', sirv(epoxyPath, { dev: true, etag: true }));

                server.middlewares.use('/baremux/', sirv(baremuxPath, { dev: true, etag: true }));

                const serveLibcurl = sirv(libcurlPath, { dev: true, etag: true });
                server.middlewares.use('/libcurl/', (req, res, next) => {

                    if (req.originalUrl.endsWith('.mjs')) {
                        res.setHeader('Content-Type', 'application/javascript');
                    }
                    serveLibcurl(req, res, next);
                });
            },
        },
    };
}

export default defineConfig({
    root: "./client",
    outDir: "./dist",
    publicDir: "./client/public",
    srcDir: "./client/src",
    vite: {
        plugins: [tailwindcss()]
    },

    integrations: [
        customDevServer()
    ]
});