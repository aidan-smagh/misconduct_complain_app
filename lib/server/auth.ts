import { auth, db } from "@/firebaseConfig";
import * as argon2 from 'argon2';
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { isValidEmail, isValidPassord, isValidUsername } from "@/lib/validation/validation_rules";
import { CodeAccount, StandardAccount } from "../types/auth";
import { AccountData } from "../types/account";

const expiresIn = 7 * 24 * 60 * 60; // 7 days

const secureCookieOptions: Partial<ResponseCookie> = {
  maxAge: expiresIn,
  httpOnly: true,
  sameSite: 'lax'
};

async function hashPassword(password: string) {
  return argon2.hash(password);
}

async function verifyPassword(digest: string, password: string) {
  return argon2.verify(digest, password);
}

async function hashCodeAccountDetails(code: string, answers: string[]) {
  const identifier = code + "\0" + answers.join("\0");
  return (await argon2.hash(identifier)).replace("/", "\\");
}

// Creates a new account and returns the unique account ID
async function createAccount() {
  const colRef = db.collection("accounts");

  const data: AccountData = {
    dateCreated: new Date()
  }

  // Add entry to database
  const docRef = await colRef.add(data);

  return docRef.id;
}

// Create custom token for uid
export async function login(id: string) {
  // Get custom token from Fireabse Auth
  return await auth.createCustomToken(id);
}

// Creates an account that uses a unique identifier and password
async function createStandardAccount(identifier: string, password: string) {
  let docRef = db.doc(`standardUsers/${identifier}`);

  // Ensure identifier doesn't already exist
  const user = await docRef.get();

  if (user.exists) {
    return null;
  }

  // Create account data object
  const accountId = await createAccount();

  // Store credentials
  const credentials = {
    password: await hashPassword(password),
    accountId
  }

  await docRef.set(credentials);

  // Return account id
  return accountId;
}

export async function createEmailAccount(email: string, password: string) {
  // Check email and password are valid
  if (!isValidEmail(email) || !isValidPassord(password)) {
    return null;
  }

  return await createStandardAccount(email, password);
}

export async function createUsernameAccount(username: string, password: string) {
  // Check username and password are valid
  if (!isValidUsername(username) || !isValidPassord(password)) {
    return null;
  }

  return await createStandardAccount(username, password);
}

export async function createCodeAccount(code: string, answers: string[]) {
  const hash = hashCodeAccountDetails(code, answers);

  const userRef = db.doc(`codeUsers/${hash}`);

  // Ensure identifier doesn't already exist
  const userSnap = await userRef.get();

  if (userSnap.exists) {
    return null;
  }

  // Create account data object
  const accountId = await createAccount();

  // Store credentials
  const credentials = {
    accountId
  }

  await userRef.set(credentials);

  // Return account id
  return accountId;
}

export async function loginStandardAccount(identifier: string, password: string) {
  // Check if identifier exists
  const userRef = db.doc(`standardUsers/${identifier}`);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    return null;
  }

  // Verify password
  const accountCredentials = userSnap.data() as StandardAccount;

  if (!(await verifyPassword(accountCredentials.password, password))) {
    return null;
  }

  // Login
  return await login(accountCredentials.accountId);
}

export async function loginCodeAccount(code: string, answers: string[]) {
  const hash = hashCodeAccountDetails(code, answers);

  // Check if identifier exists
  const userRef = db.doc(`codeUsers/${hash}`);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    return null;
  }

  // Create account data object
  const accountCredentials = userSnap.data() as CodeAccount;

  // Return account id
  return await login(accountCredentials.accountId);
}