import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { env } from "$env/dynamic/private";
import { randomUUID } from "crypto";

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
const CHALLENGE_PK = "challenge";

export interface ChallengeTimespan {
  startTime: Date;
  endTime: Date;
}

export interface Challenge {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
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
    timespan == null
      ? null
      : {
          startTime: timespan.startTime.toISOString(),
          endTime: timespan.endTime.toISOString(),
        };

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

/**
 * Get all challenges from DynamoDB or mock store
 */
export async function getChallenges(): Promise<Challenge[]> {
  // If no table name is set, use mock store
  if (!TABLE_NAME || !docClient) {
    const challenges: Challenge[] = [];
    for (const [key, value] of mockStore.entries()) {
      if (key.startsWith(`${CHALLENGE_PK}#`)) {
        if (
          typeof value === "object" &&
          value !== null &&
          "id" in value &&
          typeof value.id === "string" &&
          "title" in value &&
          typeof value.title === "string" &&
          "imageUrl" in value &&
          typeof value.imageUrl === "string" &&
          "createdAt" in value &&
          typeof value.createdAt === "string" &&
          "updatedAt" in value &&
          typeof value.updatedAt === "string"
        ) {
          challenges.push({
            id: value.id,
            title: value.title,
            imageUrl: value.imageUrl,
            createdAt: new Date(value.createdAt),
            updatedAt: new Date(value.updatedAt),
          });
        }
      }
    }
    return challenges;
  }

  try {
    const response = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: {
          ":pk": CHALLENGE_PK,
        },
      }),
    );

    if (!response.Items) {
      return [];
    }

    return response.Items.map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    }));
  } catch (error) {
    console.error("Error fetching challenges from DynamoDB:", error);
    return [];
  }
}

/**
 * Get a single challenge by ID from DynamoDB or mock store
 */
export async function getChallenge(id: string): Promise<Challenge | null> {
  // If no table name is set, use mock store
  if (!TABLE_NAME || !docClient) {
    const mockData = mockStore.get(`${CHALLENGE_PK}#${id}`);

    if (
      mockData == null ||
      typeof mockData !== "object" ||
      !("id" in mockData) ||
      typeof mockData.id !== "string" ||
      !("title" in mockData) ||
      typeof mockData.title !== "string" ||
      !("imageUrl" in mockData) ||
      typeof mockData.imageUrl !== "string" ||
      !("createdAt" in mockData) ||
      typeof mockData.createdAt !== "string" ||
      !("updatedAt" in mockData) ||
      typeof mockData.updatedAt !== "string"
    ) {
      return null;
    }

    return {
      id: mockData.id,
      title: mockData.title,
      imageUrl: mockData.imageUrl,
      createdAt: new Date(mockData.createdAt),
      updatedAt: new Date(mockData.updatedAt),
    };
  }

  try {
    const response = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: CHALLENGE_PK,
          SK: id,
        },
      }),
    );

    if (!response.Item) {
      return null;
    }

    return {
      id: response.Item.id,
      title: response.Item.title,
      imageUrl: response.Item.imageUrl,
      createdAt: new Date(response.Item.createdAt),
      updatedAt: new Date(response.Item.updatedAt),
    };
  } catch (error) {
    console.error("Error fetching challenge from DynamoDB:", error);
    return null;
  }
}

/**
 * Create a new challenge in DynamoDB or mock store
 */
export async function createChallenge(data: { title: string; imageUrl: string }): Promise<Challenge> {
  const id = randomUUID();
  const now = new Date();

  const challenge: Challenge = {
    id,
    title: data.title,
    imageUrl: data.imageUrl,
    createdAt: now,
    updatedAt: now,
  };

  const dbItem = {
    id: challenge.id,
    title: challenge.title,
    imageUrl: challenge.imageUrl,
    createdAt: challenge.createdAt.toISOString(),
    updatedAt: challenge.updatedAt.toISOString(),
  };

  // If no table name is set, use mock store
  if (!TABLE_NAME || !docClient) {
    mockStore.set(`${CHALLENGE_PK}#${id}`, dbItem);
    return challenge;
  }

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: CHALLENGE_PK,
          SK: id,
          ...dbItem,
        },
      }),
    );

    return challenge;
  } catch (error) {
    console.error("Error creating challenge in DynamoDB:", error);
    throw new Error("Failed to create challenge");
  }
}

/**
 * Update an existing challenge in DynamoDB or mock store
 */
export async function updateChallenge(id: string, data: { title: string; imageUrl: string }): Promise<Challenge> {
  const now = new Date();

  const challenge: Challenge = {
    id,
    title: data.title,
    imageUrl: data.imageUrl,
    createdAt: now, // Will be overwritten with actual createdAt from existing item
    updatedAt: now,
  };

  // Get existing challenge to preserve createdAt
  const existing = await getChallenge(id);
  if (existing) {
    challenge.createdAt = existing.createdAt;
  }

  const dbItem = {
    id: challenge.id,
    title: challenge.title,
    imageUrl: challenge.imageUrl,
    createdAt: challenge.createdAt.toISOString(),
    updatedAt: challenge.updatedAt.toISOString(),
  };

  // If no table name is set, use mock store
  if (!TABLE_NAME || !docClient) {
    mockStore.set(`${CHALLENGE_PK}#${id}`, dbItem);
    return challenge;
  }

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: CHALLENGE_PK,
          SK: id,
          ...dbItem,
        },
      }),
    );

    return challenge;
  } catch (error) {
    console.error("Error updating challenge in DynamoDB:", error);
    throw new Error("Failed to update challenge");
  }
}

/**
 * Delete a challenge from DynamoDB or mock store
 */
export async function deleteChallenge(id: string): Promise<void> {
  // If no table name is set, use mock store
  if (!TABLE_NAME || !docClient) {
    mockStore.delete(`${CHALLENGE_PK}#${id}`);
    return;
  }

  try {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: CHALLENGE_PK,
          SK: id,
        },
      }),
    );
  } catch (error) {
    console.error("Error deleting challenge from DynamoDB:", error);
    throw new Error("Failed to delete challenge");
  }
}
