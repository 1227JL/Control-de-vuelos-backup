import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const checkAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
        
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.usuario = await Usuario.findById(decoded.id).select(
        "-password -confirmado -token -createdAt -updatedAt -__v"
      );
      return next();
    } catch (error) {
      console.error("Error al autenticar al usuario:", error);
      return res.status(401).json({ msg: "Token no válido" });
    }
  }

  if (!token) {
    return res.status(401).json({ msg: "Token no proporcionado" });
  }

  next();
};

export default checkAuth;
