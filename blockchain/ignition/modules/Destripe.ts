import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const LockModule = buildModule("DestripeModule", (m) => {
  const destripeCollection = m.contract("DestripeCollection", [], {});
  const destripeCoin = m.contract("DestripeCoin", [], {});
  const destripe = m.contract("Destripe", [destripeCoin, destripeCollection], {
    after: [destripeCoin, destripeCollection],
  });

  m.call(destripeCollection, "setAuthorizedContract", [destripe]);

  return { destripe, destripeCoin, destripeCollection };
});

export default LockModule;
