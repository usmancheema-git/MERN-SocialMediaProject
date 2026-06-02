import express from 'express';
import {testcontroller} from '../controllers/testcontroller'
const router = express.Router();

router.get('/test-api',testcontroller);

export  default router;