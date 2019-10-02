import { writable } from "svelte/store"

export const ongoingRequests = writable([])

//TODO `hasBlockingRequests`
//TODO `hasOngoingRequests`
//TODO `hasBackgroundRequests`