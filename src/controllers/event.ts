import { providers, Contract, ethers } from "ethers";
import PingPongABI from "../abi/PingPong.json";

const provider = new providers.AlchemyWebSocketProvider(
  "goerli",
  process.env.ALCHEMY_KEY
);
const contract = new Contract(
  process.env.PINGPONG_CONTRACT || "",
  PingPongABI,
  provider
);

export const checkEvents = async () => {
  const curBlock = await provider.getBlockNumber();

  contract.on("Ping", (...args) => {
    console.log("Ping", args);
  });
};
