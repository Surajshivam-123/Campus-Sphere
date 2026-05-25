import mongoose, { Schema } from "mongoose";

const testCaseSchema = new Schema({
  input:          { type: String, default: "" },
  expectedOutput: { type: String, default: "" },
  isSample:       { type: Boolean, default: false }, // shown to participants
});

const problemSchema = new Schema(
  {
    event:       { type: Schema.Types.ObjectId, ref: "Event", required: true },
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true },
    inputFormat:  { type: String, default: "" },
    outputFormat: { type: String, default: "" },
    constraints:  { type: String, default: "" },
    difficulty:   { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    points:       { type: Number, default: 100 },
    timeLimit:    { type: Number, default: 2 },   // seconds
    memoryLimit:  { type: Number, default: 256 },  // MB
    testCases:    [testCaseSchema],
    order:        { type: Number, default: 0 },    // display order in contest
    createdBy:    { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

problemSchema.index({ event: 1, order: 1 });

export const Problem = mongoose.model("Problem", problemSchema);
