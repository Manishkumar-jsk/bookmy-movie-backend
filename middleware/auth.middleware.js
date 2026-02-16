import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const token = req.headers.cookie?.split(';')[1]?.split("=")[1];

  console.log(token,"token")

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: `Invalid token ${error.message}`});
  }
};

export default auth;
