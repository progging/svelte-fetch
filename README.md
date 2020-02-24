# SVELTE-FETCH

> A very thin wrapper around `fetch` with Svelte store integration for request states.

## Why
When making a web app, I **always** end up adding ongoing requests to some central state array so that I can compute when my application is "loading". That's basically what this is: a thin wrapper around the native `fetch` API, with importable Svelte [`readables`](https://svelte.dev/docs#readable) that can be used to show spinners and blocking modals for various request states.

## Install
`npm i -S svelte-fetch` or `yarn add svelte-fetch`

## Usage
```html
<script>

    import Fetch, {
        hasAny,
        hasBlocking,
        hasBackground
    } from "svelte-fetch"

    const fetch = new Fetch()

    const [res1, res2, res3] = await Promise.all([
        // Makes a regular request (typically shows a spinner in the UI)
        fetch.get("http://localhost:3000/dev/ping?delay=1000"),
        //Makes a blocking request (typically block UI interaction)
        fetch.blocking.get("http://localhost:3000/dev/ping?delay=1000"),
        //Makes a background request (typically invisible to the UI)
        fetch
            .background
            .expect(JSON)
            .get("http://localhost:3000/dev/ping?delay=1000"),
    ])

    console.log(res1, res2, res3)

</script>

{#if $hasAny}
    Loading!
{/if}

{#if $hasBlocking}
    Loading (blocked)!
{/if}

{#if $hasBackground}
    Loading (background)!
{/if}

```

## API

### `SvelteFetch.request`
A wrapper around  [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

### `SvelteFetch.get`
Shorthand for using `SvelteFetch.request` with the `{method:"GET"}` option.

### `SvelteFetch.put`
Shorthand for using `SvelteFetch.request` with the `{method:"PUT"}` option.

### `SvelteFetch.post`
Shorthand for using `SvelteFetch.request` with the `{method:"POST"}` option.

### `SvelteFetch.destroy`
Shorthand for using `SvelteFetch.request` with the `{method:"DELETE"}` option.

### `SvelteFetch.background`
Adds the next request to the background queue (available from the export `hasBackground`), and removes it when it completes.

```javascript
    const fetch = new SvelteFetch()
    
    const data = await fetch.background.get(`https://endpoint`)
```

### `SvelteFetch.blocking`
Adds the next request to the blocking queue (available from the export `hasBlocking`), and removes it when it completes.

```javascript
    const fetch = new SvelteFetch()
    
    const data = await fetch.blocking.get(`https://endpoint`)
```

### `SvelteFetch.expect`
Tells the request what data to expect next. Supports:
* `JSON`
* `Number` (will use the `JSON` parser)
* `String`
* `Image`
* `Blob`
If `SvelteFetch.expect` is not used, data from the request is parsed using the `Content-Type` header.

```javascript
    const fetch = new SvelteFetch()
    
    const data = await fetch.expect(JSON).get(`https://endpoint`)
```
