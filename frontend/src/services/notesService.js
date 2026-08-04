import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";

// ===============================
// Update Note
// ===============================
export const updateNote = async (id, data) => {
  await updateDoc(doc(db, "notes", id), data);
};

// ===============================
// Add Note
// ===============================
export const addNote = async (note, uid) => {
  const docRef = await addDoc(collection(db, "notes"), {
    ...note,
    tags: note.tags || [],
    trash: note.trash || false,
    pinned: note.pinned || false,
    favorite: note.favorite || false,
    uid,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return docRef.id;
};

// ===============================
// Get User Notes
// ===============================
export const getNotes = async (uid) => {
  const q = query(
    collection(db, "notes"),
    where("uid", "==", uid)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// ===============================
// Move Note To Trash
// ===============================
export const moveToTrash = async (id) => {
  await updateDoc(doc(db, "notes", id), {
    trash: true,
    updatedAt: Date.now(),
  });
};

// ===============================
// Restore Note From Trash
// ===============================
export const restoreNote = async (id) => {
  await updateDoc(doc(db, "notes", id), {
    trash: false,
    updatedAt: Date.now(),
  });
};

// ===============================
// Permanently Delete Note
// ===============================
export const deleteNotePermanently = async (id) => {
  await deleteDoc(doc(db, "notes", id));
};

// ===============================
// Old Delete Function
// Keep for compatibility
// ===============================
export const deleteNote = async (id) => {
  await deleteDoc(doc(db, "notes", id));
};