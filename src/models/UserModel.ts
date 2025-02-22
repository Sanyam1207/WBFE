import mongoose from "mongoose";

export interface User {
  _id?: mongoose.Types.ObjectId;
  name?: string;
  email?: string;
  password?: string;
  favourite?: string[];
  mobileNumber?: number;
}

const userSchema = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    favourite: {
      type: [String],
      default: [],
    },
    mobileNumber: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel =
  mongoose.models?.User || mongoose.model<User>("User", userSchema);
export default UserModel;
