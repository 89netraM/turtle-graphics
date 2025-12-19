import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { env } from "$env/dynamic/private";

// Mock in-memory store for local development
const mockStore = new Map<string, unknown>();

// DynamoDB client (only initialized if table name is set)
let docClient: DynamoDBDocumentClient | null = null;

if (env.DYNAMODB_TABLE_NAME) {
  const client = new DynamoDBClient({});
  docClient = DynamoDBDocumentClient.from(client);
}

const TABLE_NAME = env.DYNAMODB_TABLE_NAME;
const PLAYGROUND_SETTINGS_PK = "adminSetting";
const PLAYGROUND_SETTINGS_SK = "playgroundCloseOff";

export interface PlaygroundSettings {
  closeTime: string | null;
}

/**
 * Get playground settings from DynamoDB or mock store
 */
export async function getPlaygroundSettings(): Promise<PlaygroundSettings> {
  // If no table name is set, use mock store
  if (!TABLE_NAME || !docClient) {
    const mockData = mockStore.get(`${PLAYGROUND_SETTINGS_PK}#${PLAYGROUND_SETTINGS_SK}`);
    return (mockData as PlaygroundSettings) ?? { closeTime: null };
  }

  try {
    const response = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: PLAYGROUND_SETTINGS_PK,
          SK: PLAYGROUND_SETTINGS_SK,
        },
      }),
    );

    if (!response.Item) {
      return { closeTime: null };
    }

    return {
      closeTime: response.Item.closeTime,
    };
  } catch (error) {
    console.error("Error fetching playground settings from DynamoDB:", error);
    // Return default if error occurs
    return { closeTime: null };
  }
}

/**
 * Set playground settings in DynamoDB or mock store
 */
export async function setPlaygroundSettings(closeTime: string | null): Promise<void> {
  // If no table name is set, use mock store
  if (!TABLE_NAME || !docClient) {
    mockStore.set(`${PLAYGROUND_SETTINGS_PK}#${PLAYGROUND_SETTINGS_SK}`, { closeTime });
    return;
  }

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: PLAYGROUND_SETTINGS_PK,
          SK: PLAYGROUND_SETTINGS_SK,
          closeTime: closeTime,
        },
      }),
    );
  } catch (error) {
    console.error("Error setting playground settings in DynamoDB:", error);
    throw new Error("Failed to update playground settings");
  }
}
