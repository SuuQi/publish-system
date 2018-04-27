import { Router } from 'site-middle-layer';
import { home } from './controller';

const router = new Router();

router.get('/', home);

export default router;
