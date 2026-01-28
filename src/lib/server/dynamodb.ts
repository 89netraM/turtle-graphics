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
const ACCOUNT_PK = "account";
const SUBMISSION_PK_PREFIX = "submission#";

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

export interface Account {
  username: string;
  password: string; // hashed
  createdAt: Date;
}

export interface Submission {
  username: string;
  challengeId: string;
  code: string;
  submittedAt: Date;
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
    challenges.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
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

    const challenges = response.Items.map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    }));
    challenges.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    return challenges;
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

// ============================================================================
// Account functions
// ============================================================================

/**
 * Create a new account in DynamoDB or mock store
 */
export async function createAccount(username: string, hashedPassword: string): Promise<Account> {
  const now = new Date();
  const normalizedUsername = username.toLowerCase();

  const account: Account = {
    username: normalizedUsername,
    password: hashedPassword,
    createdAt: now,
  };

  const dbItem = {
    username: account.username,
    password: account.password,
    createdAt: account.createdAt.toISOString(),
  };

  // If no table name is set, use mock store
  if (!TABLE_NAME || !docClient) {
    mockStore.set(`${ACCOUNT_PK}#${normalizedUsername}`, dbItem);
    return account;
  }

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: ACCOUNT_PK,
          SK: normalizedUsername,
          ...dbItem,
        },
      }),
    );

    return account;
  } catch (error) {
    console.error("Error creating account in DynamoDB:", error);
    throw new Error("Failed to create account");
  }
}

/**
 * Get an account by username from DynamoDB or mock store
 */
export async function getAccount(username: string): Promise<Account | null> {
  const normalizedUsername = username.toLowerCase();

  // If no table name is set, use mock store
  if (!TABLE_NAME || !docClient) {
    const mockData = mockStore.get(`${ACCOUNT_PK}#${normalizedUsername}`);

    if (
      mockData == null ||
      typeof mockData !== "object" ||
      !("username" in mockData) ||
      typeof mockData.username !== "string" ||
      !("password" in mockData) ||
      typeof mockData.password !== "string" ||
      !("createdAt" in mockData) ||
      typeof mockData.createdAt !== "string"
    ) {
      return null;
    }

    return {
      username: mockData.username,
      password: mockData.password,
      createdAt: new Date(mockData.createdAt),
    };
  }

  try {
    const response = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: ACCOUNT_PK,
          SK: normalizedUsername,
        },
      }),
    );

    if (!response.Item) {
      return null;
    }

    return {
      username: response.Item.username,
      password: response.Item.password,
      createdAt: new Date(response.Item.createdAt),
    };
  } catch (error) {
    console.error("Error fetching account from DynamoDB:", error);
    return null;
  }
}

// ============================================================================
// Submission functions
// ============================================================================

/**
 * Create or update a submission in DynamoDB or mock store
 */
export async function createOrUpdateSubmission(
  username: string,
  challengeId: string,
  code: string,
): Promise<Submission> {
  const now = new Date();
  const normalizedUsername = username.toLowerCase();

  // Check if submission already exists to preserve submittedAt
  const existing = await getSubmission(normalizedUsername, challengeId);

  const submission: Submission = {
    username: normalizedUsername,
    challengeId,
    code,
    submittedAt: existing?.submittedAt ?? now,
    updatedAt: now,
  };

  const dbItem = {
    username: submission.username,
    challengeId: submission.challengeId,
    code: submission.code,
    submittedAt: submission.submittedAt.toISOString(),
    updatedAt: submission.updatedAt.toISOString(),
  };

  // If no table name is set, use mock store
  if (!TABLE_NAME || !docClient) {
    mockStore.set(`${SUBMISSION_PK_PREFIX}${normalizedUsername}#challenge#${challengeId}`, dbItem);
    return submission;
  }

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `${SUBMISSION_PK_PREFIX}${normalizedUsername}`,
          SK: `challenge#${challengeId}`,
          GSI1PK: `${SUBMISSION_PK_PREFIX}${challengeId}`,
          GSI1SK: normalizedUsername,
          ...dbItem,
        },
      }),
    );

    return submission;
  } catch (error) {
    console.error("Error creating/updating submission in DynamoDB:", error);
    throw new Error("Failed to save submission");
  }
}

/**
 * Get a submission by username and challenge ID from DynamoDB or mock store
 */
export async function getSubmission(username: string, challengeId: string): Promise<Submission | null> {
  const normalizedUsername = username.toLowerCase();

  // If no table name is set, use mock store
  if (!TABLE_NAME || !docClient) {
    const mockData = mockStore.get(`${SUBMISSION_PK_PREFIX}${normalizedUsername}#challenge#${challengeId}`);

    if (
      mockData == null ||
      typeof mockData !== "object" ||
      !("username" in mockData) ||
      typeof mockData.username !== "string" ||
      !("challengeId" in mockData) ||
      typeof mockData.challengeId !== "string" ||
      !("code" in mockData) ||
      typeof mockData.code !== "string" ||
      !("submittedAt" in mockData) ||
      typeof mockData.submittedAt !== "string" ||
      !("updatedAt" in mockData) ||
      typeof mockData.updatedAt !== "string"
    ) {
      return null;
    }

    return {
      username: mockData.username,
      challengeId: mockData.challengeId,
      code: mockData.code,
      submittedAt: new Date(mockData.submittedAt),
      updatedAt: new Date(mockData.updatedAt),
    };
  }

  try {
    const response = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `${SUBMISSION_PK_PREFIX}${normalizedUsername}`,
          SK: `challenge#${challengeId}`,
        },
      }),
    );

    if (!response.Item) {
      return null;
    }

    return {
      username: response.Item.username,
      challengeId: response.Item.challengeId,
      code: response.Item.code,
      submittedAt: new Date(response.Item.submittedAt),
      updatedAt: new Date(response.Item.updatedAt),
    };
  } catch (error) {
    console.error("Error fetching submission from DynamoDB:", error);
    return null;
  }
}

/**
 * Get all submissions by a user from DynamoDB or mock store
 */
export async function getSubmissionsByUser(username: string): Promise<Submission[]> {
  const normalizedUsername = username.toLowerCase();

  // If no table name is set, use mock store
  if (!TABLE_NAME || !docClient) {
    const submissions: Submission[] = [];
    for (const [key, value] of mockStore.entries()) {
      if (key.startsWith(`${SUBMISSION_PK_PREFIX}${normalizedUsername}#challenge#`)) {
        if (
          typeof value === "object" &&
          value !== null &&
          "username" in value &&
          typeof value.username === "string" &&
          "challengeId" in value &&
          typeof value.challengeId === "string" &&
          "code" in value &&
          typeof value.code === "string" &&
          "submittedAt" in value &&
          typeof value.submittedAt === "string" &&
          "updatedAt" in value &&
          typeof value.updatedAt === "string"
        ) {
          submissions.push({
            username: value.username,
            challengeId: value.challengeId,
            code: value.code,
            submittedAt: new Date(value.submittedAt),
            updatedAt: new Date(value.updatedAt),
          });
        }
      }
    }
    return submissions;
  }

  try {
    const response = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: {
          ":pk": `${SUBMISSION_PK_PREFIX}${normalizedUsername}`,
        },
      }),
    );

    if (!response.Items) {
      return [];
    }

    return response.Items.map((item) => ({
      username: item.username,
      challengeId: item.challengeId,
      code: item.code,
      submittedAt: new Date(item.submittedAt),
      updatedAt: new Date(item.updatedAt),
    }));
  } catch (error) {
    console.error("Error fetching submissions by user from DynamoDB:", error);
    return [];
  }
}

/**
 * Get all submissions for a challenge from DynamoDB or mock store
 */
export async function getSubmissionsByChallenge(challengeId: string): Promise<Submission[]> {
  // If no table name is set, use mock store
  if (!TABLE_NAME || !docClient) {
    const submissions: Submission[] = [];
    for (const [key, value] of mockStore.entries()) {
      if (key.includes(`#challenge#${challengeId}`)) {
        if (
          typeof value === "object" &&
          value !== null &&
          "username" in value &&
          typeof value.username === "string" &&
          "challengeId" in value &&
          typeof value.challengeId === "string" &&
          "code" in value &&
          typeof value.code === "string" &&
          "submittedAt" in value &&
          typeof value.submittedAt === "string" &&
          "updatedAt" in value &&
          typeof value.updatedAt === "string"
        ) {
          submissions.push({
            username: value.username,
            challengeId: value.challengeId,
            code: value.code,
            submittedAt: new Date(value.submittedAt),
            updatedAt: new Date(value.updatedAt),
          });
        }
      }
    }
    return submissions;
  }

  try {
    const response = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :gsi1pk",
        ExpressionAttributeValues: {
          ":gsi1pk": `${SUBMISSION_PK_PREFIX}${challengeId}`,
        },
      }),
    );

    if (!response.Items) {
      return [];
    }

    return response.Items.map((item) => ({
      username: item.username,
      challengeId: item.challengeId,
      code: item.code,
      submittedAt: new Date(item.submittedAt),
      updatedAt: new Date(item.updatedAt),
    }));
  } catch (error) {
    console.error("Error fetching submissions by challenge from DynamoDB:", error);
    return [];
  }
}
