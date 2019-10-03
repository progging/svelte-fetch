import { ongoingRequests } from "./store";
let requestIndex = 0

export default class SvelteFetch {
    constructor() {
        //TODO
    }

    static async request(url, options, extra) {

        requestIndex++

        const req = fetch(url, options)

        //TODO Uses instance config.
    }

    async request () {
        //TODO Uses ad-hoc config.
    }
}