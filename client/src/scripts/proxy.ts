import { BareMuxConnection } from '@mercuryworkshop/bare-mux';

// temp: change default to lib
const wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
var transport = "/libcurl/index.mjs";
const { ScramjetController } = $scramjetLoadController();

if (localStorage.getItem('transport') === 'lib') {
    transport = '/libcurl/index.mjs';
}

const scramjet = new ScramjetController({
    files: {
        wasm: "/math/scramjet.wasm.wasm",
        all: "/math/scramjet.all.js",
        sync: "/math/scramjet.sync.js",
    },
    flags: {
        rewriterLogs: false,
        scramitize: false,
        cleanErrors: true,
        sourcemaps: true,
    },
    siteFlags: {

    },
    prefix: '/$/'
});

scramjet.init();
navigator.serviceWorker.register("./sw.js");

const bmc = new BareMuxConnection("/baremux/worker.js");
bmc.setTransport(transport, [{ wisp: wispUrl }]);

export default scramjet;