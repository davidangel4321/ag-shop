import { db } from './firebase'
import {
  collection, doc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, query, orderBy
} from 'firebase/firestore'

export async function getCollection(name) {
  const snap = await getDocs(collection(db, name))
  return snap.docs.map(d => ({ ...d.data(), _docId: d.id }))
}

export async function setDocument(collectionName, id, data) {
  await setDoc(doc(db, collectionName, id), data)
}

export async function updateDocument(collectionName, id, data) {
  // Strip internal _docId before writing; keep photo (compressed before calling)
  const { _docId, ...safeData } = data
  await setDoc(doc(db, collectionName, id), safeData)
}

export async function updateStockOnly(productId, stock) {
  await updateDoc(doc(db, 'products', productId), { stock })
}

export async function updateProductStock(productId, stockData) {
  await updateDoc(doc(db, 'products', productId), stockData)
}

export async function deleteDocument(collectionName, id) {
  await deleteDoc(doc(db, collectionName, id))
}
