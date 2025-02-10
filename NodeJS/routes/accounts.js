import fs from "fs";
import path from "path";
import express from "express";

const router = express.Router();

const ACCOUNTS_FOLDER_PATH = path.resolve(__dirname, "../data/accounts/");