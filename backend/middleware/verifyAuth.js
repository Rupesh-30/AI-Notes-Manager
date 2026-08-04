const admin = require("../config/firebaseAdmin");

async function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing authentication token",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

    req.uid = decodedToken.uid;

    next();
  } catch (error) {
    console.error("AUTH VERIFICATION ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
}

module.exports = verifyAuth;