import mongoose from "mongoose";

const importLog = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  error_filename: {
    type: String,
  },
  type: {
    type: String,
    enum: ["CSV"],
    default: "CSV",
    required: true,
  },
  import_type:{type:String},
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
    required: true,
  },
  total_records: {
    type: Number,
    default: 0,
  },
  imported_records: {
    type: Number,
    default: 0,
  },
  updated_records: {
    type: Number,
    default: 0,
  },
  error: {
    type: Number,
    default: 0,
  },
  archive_count: {
    type: Number,
    default: 0,
  },

  transaction_count: {
    type: Number,
    default: 0,
  },
  user_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  }
},{timestamps:true});

export default mongoose.model("Import_Log",importLog)