import dotenv from 'dotenv';
dotenv.config();
import { JsonRpcProvider, Contract, Wallet } from 'ethers';
import artifacts from '../abis/Destripe.json';

import app from './app';

function getContract(): Contract {
    const provider = new JsonRpcProvider(process.env.INFURA_URL);
    return new Contract(`${process.env.DESTRIPE_CONTRACT}`, artifacts.abi, provider);
}

function getSigner(): Contract {
    const provider = new JsonRpcProvider(process.env.INFURA_URL);
    const signer = new Wallet(`${process.env.PRIVATE_KEY}`, provider);
    return new Contract(`${process.env.DESTRIPE_CONTRACT}`, artifacts.abi, signer);
}

function getCostumers(): Promise<string[]> {
    return getContract().getCustomers();
}

type Customer = {
    tokenId: number;
    index: number;
    nextPayment: number;
}

function getCustomerInfo(customer: string): Promise<Customer> {
    return getContract().payments(customer) as Promise<Customer>;
}

async function pay(customer: string): Promise<string> {
    const tx = await getSigner().pay(customer);
    const receipt = await tx.wait();
    return tx.hash;
}

async function paymentCycle() {
    console.log('Running the payment cycle...');
    const customers = await getCostumers();

    for (let i = 0; i < customers.length; i++) {
        if (customers[i] === "0x0000000000000000000000000000000000000000") continue;

        const customer = await getCustomerInfo(customers[i]);
        if (customer.nextPayment <= (Date.now() / 1000)) {
            await pay(customers[i]);
        }
    }

    console.log('Finishing payment cycle.');
}

setInterval(paymentCycle, 60 * 60 * 1000);

const PORT: number = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
