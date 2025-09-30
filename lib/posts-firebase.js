// Import t
// Import the initialized Firestore database object from local firebase setup
import { db } from "./firebase";
// Import Firestore helpers for reading collections and building queries
import { collection, getDocs, query, where, documentId } from "firebase/firestore";

// Get all posts from Firestore and return them sorted and simplified
export async function getSortedPostsData() {
    // Create a reference to the "posts" collection in Firestore
    const myCollection = collection(db, "posts");
    // Fetch all documents from the collection
    const snapshot = await getDocs(myCollection);
    // Convert Firestore docs into plain objects including the doc id
    const jsonObj = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort the array of post objects by their date field in descending order
    jsonObj.sort(function(a, b) { // sort array in-place by date descending
    return b.date.localeCompare(a.date); // compare dates as strings
  });

  // Return a simplified array with only id, title, and date for each post
  return jsonObj.map(item => { // map to pared-down post objects
    return {
      id: item.id.toString(), // ensure post id is a string
      title: item.title, // keep the post title
      date: item.date, // keep the post date
    }
  });

}

// Retrieve all post document ids and format them for use in dynamic routes
export async function getAllPostIds() {
  // Reference the "posts" collection
  const myCollection = collection(db, "posts");
  // Fetch all documents in the collection
  const snapshot = await getDocs(myCollection);
  // Make a simple array of objects containing only the id
  const jsonObj = snapshot.docs.map(doc => ({ id: doc.id }));

  // Convert into the { params: { id: '...' } } shape expected by Next.js
  return jsonObj.map(item => { // map each post to params object
      return {
        params: {
          id: item.id.toString() // ensure id is a string
        }
      }
    });
}

// Fetch a single post by its document id and return its data
export async function getPostData(id) {
  // Reference the "posts" collection
  const myCollection = collection(db, "posts");
  // Build a query that finds the document with the matching document id
  const searchQuery = query(
    myCollection,
    where(
      documentId(),
      "==",
      id

    )
  );
  // Execute the query and get the matching documents
  const snapshot = await getDocs(searchQuery);
  // Convert the found documents into plain objects including ids
  const jsonObj = snapshot.docs.map(doc => ({id: doc.id, ...doc.data() }));
  
  // If no document was found, return a simple "not found" object
  if (jsonObj.length === 0) {
    return {
      id: id, // echo the requested id
      title: "Post Not Found", // fallback title when missing
      date: "", // empty date as fallback
      contentHtml: "<p>Sorry, the post you are looking for does not exist.</p>" // simple fallback HTML
    }
  } else {
    // Return the first (and only) matching post object
    return jsonObj[0]; // return the found post
  }

}

