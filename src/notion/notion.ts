import {
  Account,
  Bank,
  NotionAccount,
  NotionTransaction,
} from "../types/index.d.ts";
import {
  createEntries,
  getDatabaseEntries,
  getDatabaseId,
} from "./databases.ts";
import {
  accountToNotion,
  DatabaseType,
  notionToAccount,
  notionToTx,
  txToNotion,
} from "./models.ts";
import { getAccount, getActions } from "./util.ts";

async function syncTransactionsDatabase(account: Account) {
  const databaseId = await getDatabaseId(DatabaseType.Transactions);
  const rawStoredItems = await getDatabaseEntries(databaseId);
  const storedItems = Object.values(rawStoredItems).map((a) =>
    notionToTx(a as unknown as NotionTransaction)
  );
  const a = await getAccount(account);

  const { itemsToCreate, itemsToUpdate } = getActions(
    storedItems,
    account.transactions,
  );

  console.log(
    `\n📝 Creating ${itemsToCreate.length} new transactions in Notion.`,
  );

  await createEntries(databaseId, itemsToCreate.map((i) => txToNotion(a, i)));

  console.log("\n✅ Notion database is synced with GitHub.");
}

async function syncAccountsDatabase(bank: Bank, newAccounts: Account[]) {
  const databaseId = await getDatabaseId(DatabaseType.Accounts);
  const rawStoredItems = await getDatabaseEntries(databaseId);
  const storedItems = Object.values(rawStoredItems).map((a) =>
    notionToAccount(a as unknown as NotionAccount)
  );

  const { itemsToCreate, itemsToUpdate } = getActions(storedItems, newAccounts);

  console.log(`\n📝 Creating ${itemsToCreate.length} new accounts in Notion.`);

  await createEntries(
    databaseId,
    itemsToCreate.map((i) => accountToNotion(bank, i)),
  );

  console.log("\n✅ Notion database is synced with GitHub.");
}

export async function syncDatabases(banks: Bank[]) {
  await Promise.all(banks.map((b) => syncAccountsDatabase(b, b.accounts)));

  await Promise.all(banks.flatMap((b) => {
    b.accounts.map((a) => {
      syncTransactionsDatabase(a);
    });
  }));
}
