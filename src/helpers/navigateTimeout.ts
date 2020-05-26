import { Page, NavigationOptions, LoadEvent } from "puppeteer";
import { DEFAULT } from "../config/configuration";

export async function safeNavigateTimeout(page:Page, waitUntil?:LoadEvent, cb?:CallableFunction){

    let stopCallback:any = null
    const stopPromise = new Promise(x => stopCallback = x);
    setTimeout(()=>stopCallback(cb), DEFAULT.CONNECTION_OPTIONS.maxNavigationTime)
    return await Promise.race([
        waitUntil?page.waitForNavigation({waitUntil}):page.waitForNavigation(),
        stopPromise
    ])
}

