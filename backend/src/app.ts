import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { ownerOf } from './services/web3';

const app = express();

app.use(morgan('tiny'));
app.use(express.json());

app.get('/nfts/:tokenId', async (req: Request, res: Response, next: NextFunction) => {
    const tokenId = req.params.tokenId.replace('.json', '');

    const ownerAddress = await ownerOf(parseInt(tokenId));

    if (ownerAddress === '0x0000000000000000000000000000000000000000') {
        return res.sendStatus(404);
    }

    return res.json({
        name: `Access #${tokenId}`,
        description: 'Yours access to the system',
        image: `${process.env.BACKEND_URL}/images/${tokenId}.png`,
    });
});

app.get('/images/:tokenId', async (req: Request, res: Response, next: NextFunction) => {
    const tokenId = req.params.tokenId.replace('.png', '');

    const ownerAddress = await ownerOf(parseInt(tokenId));

    if (ownerAddress === '0x0000000000000000000000000000000000000000') {
        return res.sendStatus(404);
    }

    return res.download(`${__dirname}/../ticket.png`);
});

export default app;