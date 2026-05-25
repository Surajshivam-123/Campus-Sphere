import mongoose, { Schema } from "mongoose";

// One submission per participant per problem attempt
const submissionSchema = new Schema(
  {
    event:       { type: Schema.Types.ObjectId, ref: "Event",   required: true },
    problem:     { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    participant: { type: Schema.Types.ObjectId, ref: "User",    required: true },
    language:    { type: String, required: true },   // "cpp", "python", "java", "javascript"
    languageId:  { type: Number, required: true },   // Judge0 language ID
    code:        { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "running", "accepted", "wrong_answer", "time_limit_exceeded",
             "memory_limit_exceeded", "runtime_error", "compilation_error"],
      default: "pending",
    },
    // Per-test-case results
    testResults: [
      {
        input:          String,
        expectedOutput: String,
        actualOutput:   String,
        status:         String,
        time:           Number,  // ms
        memory:         Number,  // KB
        isSample:       Boolean,
      },
    ],
    passedCount:  { type: Number, default: 0 },
    totalCount:   { type: Number, default: 0 },
    score:        { type: Number, default: 0 },
    executionTime: { type: Number, default: 0 },  // ms, max across test cases
    memoryUsed:    { type: Number, default: 0 },  // KB, max across test cases
    errorMessage:  { type: String, default: "" },
  },
  { timestamps: true }
);

submissionSchema.index({ event: 1, participant: 1 });
submissionSchema.index({ problem: 1, participant: 1 });
submissionSchema.index({ event: 1, status: 1 });

export const Submission = mongoose.model("Submission", submissionSchema);
