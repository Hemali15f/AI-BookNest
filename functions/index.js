/**
 * Firebase Cloud Function for AI Book Recommendations.
 *
 * This function securely interacts with the Google Gemini API to provide book
 * recommendations based on user input (mood, interests). It also logs these
 * interactions to the user's Firestore feed.
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});
const {GoogleGenerativeAI} = require("@google/generative-ai");

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Retrieve API key from environment config
const GEMINI_API_KEY = functions.config().gemini.key;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define the model (gemini-pro is generally good for text-only)
const model = genAI.getGenerativeModel({model: "gemini-pro"});

// Base path for user-specific Firestore data, including app ID
const ARTIFACTS_BASE_PATH = "artifacts";

exports.generateBookRecommendation = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // 1. Basic Request Validation
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }
    if (!req.body || !req.body.prompt || !req.body.userId || !req.body.appId) {
      return res.status(400).send("Bad Request: Missing prompt, userId, or appId.");
    }

    const userPrompt = req.body.prompt;
    const userId = req.body.userId;
    const appId = req.body.appId;

    // 2. Optional: Verify Firebase Authentication Token
    /*
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return res.status(401).send("Unauthorized: No ID token provided.");
    }
    const idToken = authorizationHeader.split("Bearer ")[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (decodedToken.uid !== userId) {
        return res.status(403).send("Forbidden: User ID mismatch.");
      }
    } catch (error) {
      console.error("Error verifying ID token:", error);
      return res.status(401).send("Unauthorized: Invalid ID token.");
    }
    */

    // 3. Construct AI Prompt
    const fullPrompt =
      `As a friendly and knowledgeable AI book recommender for "AI BookNest", ` +
      `provide a single book recommendation based on the following user input: "${userPrompt}".\n` +
      `Format your response as follows:\n` +
      `Book Title: [Title of the book]\n` +
      `Author: [Author's Name]\n` +
      `Genre: [Primary Genre]\n` +
      `Summary: [A concise, engaging summary (2-4 sentences)]\n` +
      `Why this book: [1-2 sentences explaining why it fits the user's prompt]\n\n` +
      `If the input is vague, try to infer. ` +
      `If it's completely irrelevant to books, politely ask for book-related input.`;

    console.log(`Generating recommendation for user ${userId} with prompt: ${userPrompt}`);

    try {
      // 4. Call Google Gemini API
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      console.log("Gemini AI Raw Response:", text);

      // 5. Parse AI Response (Simple parsing based on expected format)
      const parsedRecommendation = {};
      const lines = text.split("\n").filter((line) => line.trim() !== "");
      lines.forEach((line) => {
        if (line.startsWith("Book Title:")) {
          parsedRecommendation.bookTitle = line.replace("Book Title:", "").trim();
        } else if (line.startsWith("Author:")) {
          parsedRecommendation.author = line.replace("Author:", "").trim();
        } else if (line.startsWith("Genre:")) {
          parsedRecommendation.genre = line.replace("Genre:", "").trim();
        } else if (line.startsWith("Summary:")) {
          parsedRecommendation.summary = line.replace("Summary:", "").trim();
        } else if (line.startsWith("Why this book:")) {
          parsedRecommendation.whyThisBook = line.replace("Why this book:", "").trim();
        }
      });

      // Default title if parsing fails
      if (!parsedRecommendation.bookTitle && text.length > 50) {
        parsedRecommendation.bookTitle = "AI Suggestion";
        parsedRecommendation.summary = text.substring(0, 100) + "...";
        parsedRecommendation.whyThisBook = "AI generated response.";
      } else if (!parsedRecommendation.bookTitle) {
        parsedRecommendation.bookTitle = "Could Not Generate Recommendation";
        parsedRecommendation.summary = text;
        parsedRecommendation.whyThisBook = "The AI could not provide a specific book in the expected format.";
      }

      // 6. Save interaction to User's Firestore Feed
      const userFeedRef = db.collection(`${ARTIFACTS_BASE_PATH}/${appId}/users/${userId}/feedItems`);
      await userFeedRef.add({
        type: "ai_recommendation",
        userPrompt: userPrompt,
        aiResponse: parsedRecommendation,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`AI recommendation saved to Firestore for user: ${userId}`);

      // 7. Send Response to Frontend
      res.status(200).json({
        success: true,
        recommendation: parsedRecommendation,
        rawAIResponse: text,
      });
    } catch (error) {
      console.error("Error calling Gemini API or saving to Firestore:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate recommendation. Please try again later.",
        error: error.message,
      });
    }
  });
});
