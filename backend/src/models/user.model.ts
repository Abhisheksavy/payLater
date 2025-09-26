import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAchievement {
  id: number;
  title: string;
  description: string;
  earned: boolean;
  earnedAt?: Date;
  icon: string;
}

export interface IGoal {
  id: number;
  title: string;
  targetPoints: number;
  targetDate: Date;
  category: string;
  currentPoints: number;
  createdAt: Date;
  status: string;
}

export interface IReminder {
  id: number;
  billId: number;
  billName: string;
  billCompany: string;
  reminderDays: number;
  reminderTime: string;
  enabled: boolean;
  createdAt: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;

  quilttExternalId?: string;
  quilttPid?: string;
  quilttUserUuid?: string;

  quilttConnections?: string[];

  quilttAccounts?: {
    id: string;
    name: string;
  }[];

  rewardPoints: number;
  cashback: number;

  achievements?: IAchievement[];
  goals?: IGoal[];
  reminders?: IReminder[];

  createdAt: Date;
}

const achievementSchema = new Schema<IAchievement>(
  {
    id: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    earned: { type: Boolean, required: true, default: false },
    earnedAt: { type: Date },
    icon: { type: String, required: true },
  },
  { _id: false }
);

const goalSchema = new Schema<IGoal>(
  {
    id: { type: Number, required: true },
    title: { type: String, required: true },
    targetPoints: { type: Number, required: true },
    targetDate: { type: Date, required: true },
    category: { type: String, required: true },
    currentPoints: { type: Number, required: true, default: 0 },
    createdAt: { type: Date, required: true },
    status: { type: String, required: true },
  },
  { _id: false }
);

const reminderSchema = new Schema<IReminder>(
  {
    id: { type: Number, required: true },
    billId: { type: Number, required: true },
    billName: { type: String, required: true },
    billCompany: { type: String, required: true },
    reminderDays: { type: Number, required: true },
    reminderTime: { type: String, required: true },
    enabled: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, required: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    quilttExternalId: { type: String, unique: true, sparse: true },
    quilttPid: { type: String, unique: true, sparse: true },
    quilttUserUuid: { type: String, unique: true, sparse: true },

    quilttConnections: [{ type: String }],

    quilttAccounts: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
      },
    ],

    rewardPoints: { type: Number, required: true, default: 0 },
    cashback: { type: Number, required: true, default: 0 },

    achievements: [achievementSchema],
    goals: [goalSchema],
    reminders: [reminderSchema],

  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
