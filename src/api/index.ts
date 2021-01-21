import bodyParser from 'body-parser';
import express, { Router } from 'express';

const api: Router = Router();

api.use(express.json({ limit: '64mb' }));
api.use(bodyParser.json({ limit: '64mb' }));

export default api;

