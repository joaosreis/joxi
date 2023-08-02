import { getCoinbaseInfo } from "./coinbase/fetcher.ts";
import { getBanks } from "./nordigen/fetcher.ts";
import { syncDatabases } from "./notion/notion.ts";
import { type Bank } from "./types/custom.d.ts";
import { warn } from "./util/logger.ts";

const banks: Bank[] = []

const hasNordigen = Deno.env.get("NORDIGEN_KEY") && Deno.env.get("NORDIGEN_SECRET")
if (hasNordigen) {
    banks.push(...await getBanks())
} else {
    warn("Ignoring Nordigen because of missing env variables")
}

const hasNotion = Deno.env.get("NOTION_TOKEN") && Deno.env.get("NOTION_DATABASE_ID")
if (hasNotion) {
    await syncDatabases(banks)
} else {
    warn("Ignoring Notion because of missing env variables")
}
