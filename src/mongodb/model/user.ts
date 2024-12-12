import { Schema, model } from "mongoose";

declare global {
  interface UserProps {
    _id: string;
    userId: string;
    name?: string;
    email: string;
    username?: string;
    avatar?: string;
    password: string;
    authentication: {
      sessionToken: string;
      refreshToken: string;
      ip: string;
    },
    role: "user" | "admin",
    provider: "credentials" | "oauth",
    lastOfflineAt: string,
    // properties: PropertyRecord[]
  }
}

const UserRecordSchema = new Schema(
  {
    userId: { type: String },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true },
    password: { type: String },
    avatar: { type: String },
    authentication: {
      // salt: { type: String },
      accessToken: { type: String },
      refreshToken: { type: String },
      resetToken: { type: String },
      ip: { type: String },
    },
    role: {
      type: String,
      default: "user"
    },
    provider: {
      type: String,
      default: "credentials"
    },
    lastOfflineAt: { type: String },
    // properties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Properties" }],
  },
  {
    timestamps: true
  }
);


const UserModel = model("User", UserRecordSchema);

export default UserModel;