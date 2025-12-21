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
const SETTINGS_PK = "adminSetting";
const CHALLENGE_TIMESPAN_SK = "challengeTimespan";

export interface ChallengeTimespan {
  startTime: Date;
  endTime: Date;
}

/**
 * Get challenge timespan from DynamoDB or mock store
 */
export async function getChallengeTimespan(): Promise<ChallengeTimespan | null> {
  // If no table name is set, use mock store
  if (!TABLE_NAME || !docClient) {
    const mockData = mockStore.get(`${SETTINGS_PK}#${CHALLENGE_TIMESPAN_SK}`);

    if (
      mockData == null ||
      typeof mockData !== "object" ||
      !("startTime" in mockData) ||
      typeof mockData.startTime !== "string" ||
      !("endTime" in mockData) ||
      typeof mockData.endTime !== "string"
    ) {
      return null;
    }

    return mockData == null
      ? null
      : {
          startTime: new Date(mockData.startTime),
          endTime: new Date(mockData.endTime),
        };
  }

  try {
    const response = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: SETTINGS_PK,
          SK: CHALLENGE_TIMESPAN_SK,
        },
      }),
    );

    if (
      response.Item == null ||
      typeof response.Item.startTime !== "string" ||
      typeof response.Item.endTime !== "string"
    ) {
      return null;
    }

    return {
      startTime: new Date(response.Item.startTime),
      endTime: new Date(response.Item.endTime),
    };
  } catch (error) {
    console.error("Error fetching challenge timespan from DynamoDB:", error);
    // Return default if error occurs
    return null;
  }
}

/**
 * Set challenge timespan in DynamoDB or mock store
 * Both startTime and endTime must be set together or both null (atomic)
 */
export async function setChallengeTimespan(timespan: ChallengeTimespan | null): Promise<void> {
  const dbItem =
    timespan == null ? null : { startTime: timespan.startTime.toISOString(), endTime: timespan.endTime.toISOString() };

  // If no table name is set, use mock store
  if (!TABLE_NAME || !docClient) {
    mockStore.set(`${SETTINGS_PK}#${CHALLENGE_TIMESPAN_SK}`, dbItem);
    return;
  }

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: SETTINGS_PK,
          SK: CHALLENGE_TIMESPAN_SK,
          ...dbItem,
        },
      }),
    );
  } catch (error) {
    console.error("Error setting challenge timespan in DynamoDB:", error);
    throw new Error("Failed to update challenge timespan");
  }
}
