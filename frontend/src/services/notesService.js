import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc
} from "firebase/firestore";

import { db } from "../firebase/config";

// Update Note
export const updateNote = async (id, data) => {
  await updateDoc(doc(db, "notes", id), data);
};

// Add Note
export const addNote = async (note, uid) => {
  const docRef = await addDoc(collection(db, "notes"), {
    ...note,
    tags: note.tags || [], // ✅ Default empty tags added
    uid,
    createdAt: Date.now(), // Number format for perfect sorting
  });

  return docRef.id;
};

// Get User Notes
export const getNotes = async (uid) => {
  const q = query(
    collection(db, "notes"),
    where("uid", "==", uid)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Delete Note
export const deleteNote = async (id) => {
  await deleteDoc(doc(db, "notes", id));
};