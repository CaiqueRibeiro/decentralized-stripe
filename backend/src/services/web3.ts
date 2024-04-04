import { JsonRpcProvider, Contract, Wallet } from 'ethers';
import destripeArtifacts from '../../abis/Destripe.json';
import nftArtifacts from '../../abis/DestripeCollection.json';

export function getDefiContract(): Contract {
    const provider = new JsonRpcProvider(process.env.INFURA_URL);
    return new Contract(`${process.env.DESTRIPE_CONTRACT}`, destripeArtifacts.abi, provider);
}

export function getSigner(): Contract {
    const provider = new JsonRpcProvider(process.env.INFURA_URL);
    const signer = new Wallet(`${process.env.PRIVATE_KEY}`, provider);
    return new Contract(`${process.env.DESTRIPE_CONTRACT}`, destripeArtifacts.abi, signer);
}

export function getNftContract(): Contract {
    const provider = new JsonRpcProvider(process.env.INFURA_URL);
    return new Contract(`${process.env.COLLECTION_CONTRACT}`, nftArtifacts.abi, provider);
}

export function ownerOf(tokenId: number): Promise<String> {
    return getNftContract().ownerOf(tokenId);
}
