import { Router } from 'express';
import { registerUser, loginUser, getUserDetails } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getUserDetails);

export default router;
