import {writable,readable,get} from "svelte/store"

let requestIndex = 0
const _ongoingRequests = writable([])

/**
 * Returns all ongoing requests.
 * @type {Array<Request>}
 */
export const ongoingRequests = readable([], function start(set) {
    const unsubscribe = _ongoingRequests.subscribe(requests => set(requests))
    return function stop() {
        unsubscribe()
    }
})


/***
 * Returns true if there are any **non-blocking** or **non-blackground** requests ongoing.
 * @type {Readable<boolean>}
 */
export const hasAny = readable(false, function start(set) {
    const unsubscribe = _ongoingRequests.subscribe(requests =>
        set(requests.filter(req => !req.meta.isBlocking && !req.meta.isBackground).length))
    return function stop() {
        unsubscribe()
    }
})


/**
 * Returns true if there are any ongoing **blocking** requests.
 * @type {Readable<boolean>}
 */
export const hasBlocking = readable(false, function start(set) {
    const unsubscribe = _ongoingRequests.subscribe(requests => set(requests.filter(req => req.meta.isBlocking).length))

    return function stop() {
        unsubscribe()
    }
})


/**
 * Returns true if there are any ongoing **background** requests.
 * @type {Readable<boolean>}
 */
export const hasBackground = readable(false, function start(set) {
    const unsubscribe = _ongoingRequests.subscribe(requests => set(requests.filter(req => req.meta.isBackground).length))
    return function stop() {
        unsubscribe()
    }
})


export default class SvelteFetch {
    constructor() {
        this._metaForNextRequest = null
    }

    async request (url, fetchOptions) {
        // This is used by the `blocking`, and `background` shorthands
        const meta = this._metaForNextRequest || {}
        this._metaForNextRequest = null

        const index = requestIndex++

        // function handleError (response) {
        //     if (!response.ok) {
        //     }
        //     return response
        // }

        const request = fetch(url, fetchOptions)
        //.then(handleError)
            .finally(() => {
                const ongoingRequests = get(_ongoingRequests)
                const indexToRemove = ongoingRequests.findIndex(request => request.index === index)
                ongoingRequests.splice(indexToRemove, 1)
                _ongoingRequests.set(ongoingRequests)
            })

        const ongoingRequests = get(_ongoingRequests)
        _ongoingRequests.set([...ongoingRequests, {index,request,meta}])

        const response = await request

        let data = null

        if(meta.expectedContentType) {
            data = await this.parseContentFromExpected(meta.expectedContentType, response)
            return data
        }

        return response
    }


    async get(url, options = {}) {
        options = Object.assign(options,{method:"GET"})
        const request = await this.request(url, options)
        return request
    }


    async destroy(url, options = {}) {
        options = Object.assign(options,{method:"DELETE"})
        throw new Error("Not implemented")
    }


    async post(url, body, options = {}) {
        options = Object.assign(options,{method:"POST"})
        throw new Error("Not implemented")
    }


    async put(url, body, options = {}) {
        options = Object.assign(options,{method:"PUT"})
        throw new Error("Not implemented")
    }


    expect(contentType) {
        this._metaForNextRequest = Object.assign(
            this._metaForNextRequest || {},
            { expectedContentType: contentType }
        )
        return this
    }


    get blocking() {
        this._metaForNextRequest = Object.assign(
            this._metaForNextRequest || {},
            { isBlocking: true }
        )
        return this

    }


    get background() {
        this._metaForNextRequest = Object.assign(
            this._metaForNextRequest || {},
            { isBackground: true }
        )
        return this
    }


    /**
     * Parses response based on the `Content-Type` header.
     * @param response {Response} from `fetch`.
     * @returns {Promise<*>} Returns data or `null` if there is none.
     */
    static async contentTypeFromHeader(response) {
        let contentType = null, data = null

        try {
            contentType = response.headers.get("content-type").toLowerCase()
        } catch(err) {
            console.info(`Couldn't parse response data from "Content-Type" header.`)
            return null
        }

        if(!contentType) {
            return null
        } else if (contentType.indexOf("json") > -1) {
            data = await response.json()
        } else if (contentType.indexOf("blob") > -1) {
            data = await response.blob()
        } else if (contentType.indexOf("text") > -1) {
            data = await response.text()
        }
        return data
    }


    /**
     * Uses the `expect` hook (i.e.) `SvelteFetch.expect(JSON|String|Blob|Image)[...]` syntax to parse data.
     * @param response {Response} from `fetch`.
     * @returns {Promise<*>} Returns data or `null` if there is none.
     */
    async parseContentFromExpected(expectedContentType, response) {
        let data = null
        switch(expectedContentType) {
            case String:
                data = await response.text()
                break
            case Blob:
            case Image:
                data = await response.blob()
            case Number:
            case JSON:
                data = await response.json()
                break
            default:
                throw new Error(`No handler for ${this._metaForNextRequest.expectedContentType}`)
        }
        return data
    }
}