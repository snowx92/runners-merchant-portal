import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  UserCredential,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

/**
 * Sign in with email and password using Firebase
 */
export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<UserCredential> {
  const auth = getFirebaseAuth();

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  } catch (error) {
    console.error("Email/password sign-in error:", error);
    throw error;
  }
}

/**
 * Create account with email and password using Firebase
 */
export async function createAccountWithEmailPassword(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<UserCredential> {
  const auth = getFirebaseAuth();

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Update user profile with display name
    await updateProfile(result.user, {
      displayName: `${firstName} ${lastName}`,
    });

    return result;
  } catch (error) {
    console.error("Account creation error:", error);
    throw error;
  }
}

/**
 * Sign in with Google using Firebase
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();

  // Optional: Add scopes
  provider.addScope("profile");
  provider.addScope("email");

  // Set custom parameters
  provider.setCustomParameters({
    prompt: "select_account",
  });

  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
}

/**
 * Sign in with Apple using Firebase
 */
export async function signInWithApple(): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  const provider = new OAuthProvider("apple.com");

  // Optional: Add scopes
  provider.addScope("email");
  provider.addScope("name");

  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    console.error("Apple sign-in error:", error);
    throw error;
  }
}

/**
 * Get the ID token from a Firebase user
 */
export async function getFirebaseIdToken(
  userCredential: UserCredential
): Promise<string> {
  const idToken = await userCredential.user.getIdToken();
  return idToken;
}
