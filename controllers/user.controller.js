import {
  deleteUserService,
  getUserService,
  updateUserService,
} from "../services/user.service.js";

export const user = async (req, res, next) => {
  try {
    const user = await getUserService({ userId: req.user.id });
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const addUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    await addUserService({ name, email, password, role });
    res
      .status(201)
      .json({ success: true, message: "User is added successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id, name, email, password, role } = req.body;
    await updateUserService({ id, name, email, password, role });
    res
      .status(200)
      .json({ success: true, message: "User is updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const id = req.params?.id;
    await deleteUserService({ id });
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
