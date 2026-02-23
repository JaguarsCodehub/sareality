import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  DocumentData,
  QueryConstraint,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Generic types
export type DbCollection = "users" | "leads" | "tasks" | "interactions";

/**
 * Add a new document to a collection with a generated ID
 */
export async function createDocument<T extends DocumentData>(
  collectionName: DbCollection,
  data: Partial<T>
) {
  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Set a document with a specific ID (useful for users table where UID is known)
 */
export async function setDocument<T extends DocumentData>(
  collectionName: DbCollection,
  id: string,
  data: Partial<T>
) {
  const docRef = doc(db, collectionName, id);
  await setDoc(docRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

/**
 * Get a single document by ID
 */
export async function getDocument<T = DocumentData>(
  collectionName: DbCollection,
  id: string
): Promise<(T & { id: string }) | null> {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T & { id: string };
  }
  return null;
}

/**
 * Update an existing document
 */
export async function updateDocument<T extends DocumentData>(
  collectionName: DbCollection,
  id: string,
  data: Partial<T>
) {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Query a collection with constraints
 */
export async function queryDocuments<T = DocumentData>(
  collectionName: DbCollection,
  constraints: QueryConstraint[]
): Promise<(T & { id: string })[]> {
  const colRef = collection(db, collectionName);
  const q = query(colRef, ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as (T & { id: string })[];
}
