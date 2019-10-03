# SVELTE-FETCH

> A very thin wrapper around `fetch` with Svelte store integration for request states.

## Why
When making a web app, I **always** end up adding ongoing requests to some central state array so that I can compute when my application is "loading". That's basically what this is: a thin wrapper around the native `fetch` API, with importable Svelte [`readables`](https://svelte.dev/docs#readable) that can be used to show spinners and blocking modals etc.

## Install
`npm i -S svelte-fetch` or `yarn add svelte-fetch`

## Usage
```sveltehtml
<script>
        import SvelteFetch,
        {ongoingRequests,
         hasOngoingRequests,
        hasOngoingBackgroundRequests,
        hasOngoingBLockingR } from "svelte-fetch"
    
        const http = new SvelteFetch()
    
        async function makeRequest() {
            const res = await http.get("https://some-endpoint/json")
        }
</script>

{#if $hasOngoingRequests}
    Loading!
{/if}

<button type="button" on:click={makeRequest}>Make request</button>

```

## API
