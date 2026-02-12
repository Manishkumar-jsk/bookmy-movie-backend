//services
import { loginService, registerService } from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const { user, token } = registerService({ name, email, password });

    res.status(201).json({
      success: true,
      token: token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await loginService({ email, password });
    res.status(200).json({
      success: true,
      token: token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};
