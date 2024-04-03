import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const LockModule = buildModule("DestripeModule", (m) => {
  const destripeCollection = m.contract("DestripeCollection", [], {});
  const destripeCoin = m.contract("DestripeCoin", [], {});
  const destripe = m.contract("Destripe", [destripeCoin.id, destripeCollection.id], {});

  m.call(destripeCollection, "setAuthorizedContract", [destripe.id]);

  return { destripe, destripeCoin, destripeCollection };
});

export default LockModule;
