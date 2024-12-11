import { generateAccessToken } from "../helper/index.js";
import { User } from "../mongodb/model/index.js";
import { expireTime, setCookie } from "./authController.js";
import { isAdminEmail } from "../middlewares/next.js";
import { asyncHandler } from "../middlewares/index.js";


/**
 * @api {get} /users Get All Records
 * @apiGroup Users
 * @access Private
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const {
    _end,
    _order,
    _start,
    _sort,
  } = req.query;

  const start = Number(_start || 0);
  const end = Number(_end || 10);

  try {
    let users = await User.find().limit(end).skip(start).lean();
    return res.status(200).json(users);

  } catch (error) {
    res.status(404).send({ error: (error as Error).message });
  }
});

/**
 * @api {get} /users Get All Records
 * @apiGroup Users
 * @access Private
 */
export const deleteAnonymousUsers = asyncHandler(async (req, res) => {
  const {
    _end,
    _order,
    _start,
    _sort,
    _delete,
    _includes
  } = req.query;

  const start = Number(_start || 0);
  const end = Number(_end || 10);


  try {
    let users = await User.find().limit(end).skip(start)
    if (typeof _includes === 'string') {
      users = users.filter(user => user.email.includes(_includes))
    }

    if (typeof _delete === 'string' && _delete === 'true') {
      let deletedIds = [] as string[];
      await Promise.all(
        users.map(async (user) => {
          try {
            const userDeleted = await User.findByIdAndDelete(user._id.toString());
            if (userDeleted?.email) {
              deletedIds.push(userDeleted.email)
            }
          } catch { }
        })
      )
      return res.status(200).send(deletedIds)
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(404).send({ error: (error as Error).message });
  }
});


/**
 * @api {post} /users Create New Record
 * @apiGroup Users
 * @access Public
 */
export const createNewUser = asyncHandler(async (req, res) => {
  const newUserBody = req.body;
  const { email } = req.body

  try {
    let userExists = await User.findOne({ email }).lean();

    if (userExists) return res.status(400).json({ email, error: "username already exists" });

    const userCreated = new User(newUserBody);
    const user = await userCreated.save();

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ error: (error as Error).message, email });
  }
});

/**
 * @api {post} /users/userID
 * @apiGroup Users
 * @access Private
 */
export const getUserByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send({ error: "Please provide an user ID" });
  }

  try {
    const user = await User.findOne({ _id: id }).lean()
    if (!user) {
      return res.status(401).send({ error: "User not found" });
    }

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ error: (error as Error).message, id });
  }
});

/**
 * @api {put} /users/userID
 * @apiGroup Users
 * @access Private
 */
export const updateUserByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const newUserBody = req.body;
  const { email, username } = newUserBody;


  try {
    const user = await User.findOne({ _id: id }).lean()
    if (!user) return res.status(401).send({ error: "User not found" });

    if (username && typeof username === 'string' && user?.username?.toLowerCase() !== username?.toLowerCase()) {
      const usernameExists = await User.findOne({ username })
      if (usernameExists) {
        return res.status(400).send({ error: "username already exists" });
      }
    }
    let isEmailChanged = false;
    if (email && typeof email === 'string' && user?.email?.toLowerCase() !== email?.toLowerCase()) {
      const userExists = await User.findOne({ email }).lean()
      if (userExists) {
        return res.status(400).send({ error: "email already exists" });
      } else {
        isEmailChanged = true
      }
    }

    if (username === '' || typeof username !== "string") {
      delete newUserBody.username
    }

    let accessToken: string | undefined;
    if (email === '' || typeof email !== "string") {
      delete newUserBody.email
    } else if (isEmailChanged) {
      accessToken = generateAccessToken({ email }, 'access', { expiresIn: expireTime });
      const refreshToken = generateAccessToken({ email }, 'refresh');
      const userAuth = (await User.findOne({ _id: id }).select('authentication').lean())?.authentication
      newUserBody.authentication = {
        ...userAuth,
        accessToken: accessToken,
        refreshToken,
      }
    }

    if (newUserBody._id) {
      delete newUserBody._id
    }
    if (!isAdminEmail(user.email)) {
      newUserBody.role = user.role
    }

    const userUpdate = await User.findByIdAndUpdate(
      id,
      newUserBody,
      { new: true }
    );
    if (!userUpdate) {
      return res.status(401).send({ error: "User not found" });
    }
    if (accessToken) {
      setCookie(res, accessToken);
    }
    const userObj = userUpdate.toObject();
    if (userObj.password)
      delete userObj.password
    res.status(200).send(userObj);
  } catch (error) {
    res.status(500).send({ error: (error as Error).message, id });
  }
});

/**
 * @api {delete} /users/userID
 * @apiGroup Users
 * @access Private
 */
export const deleteUserByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send({ error: "Please provide an user ID" });
  }

  try {
    const user = await User.findByIdAndDelete(id).lean();
    // Check for existing user
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send({ message: "User deleted successful", ...user });
  } catch (error) {
    res.status(500).send({ error: (error as Error).message, id });
  }
});
