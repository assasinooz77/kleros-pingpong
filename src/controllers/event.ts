import { providers, Contract, Wallet } from "ethers";
import PingPongABI from "../abi/PingPong.json";
import prisma from "../prisma";

const provider = new providers.AlchemyWebSocketProvider(
  "goerli",
  process.env.ALCHEMY_KEY
);
const signer = new Wallet(process.env.PRIVATE_KEY || "", provider);
const contract = new Contract(
  process.env.PINGPONG_CONTRACT || "",
  PingPongABI,
  provider
);

const fetchPreviousEvents = async (fromBlock: number, toBlock: number) => {
  const events = await contract.queryFilter("Ping", fromBlock, toBlock);
  for (const event of events) {
    await contract.connect(signer).pong(event.transactionHash);
    console.log("Pong:", event.transactionHash);
  }
  await prisma.logs.upsert({
    where: { key: "last_block" },
    create: {
      key: "last_block",
      value: toBlock,
    },
    update: {
      value: toBlock,
    },
  });
};

export const checkEvents = async () => {
  const curBlock = await provider.getBlockNumber();
  const startBlock = await prisma.logs.findFirst({
    where: { key: "start_block" },
  });
  const lastBlock = await prisma.logs.findFirst({
    where: { key: "last_block" },
  });

  if (!startBlock) {
    console.log("Start Block:", curBlock);
    await prisma.logs.create({
      data: {
        key: "start_block",
        value: curBlock,
      },
    });
  } else {
    console.log("Start Block:", startBlock.value);
    const fromBlock = lastBlock ? lastBlock.value + 1 : startBlock.value;
    await fetchPreviousEvents(fromBlock, curBlock);
  }

  contract.on("Ping", async (event) => {
    if (event.transactionHash && event.blockNumber) {
      await contract.connect(signer).pong(event.transactionHash);
      await prisma.logs.upsert({
        where: { key: "last_block" },
        create: {
          key: "last_block",
          value: event.blockNumber,
        },
        update: {
          value: event.blockNumber,
        },
      });
      console.log("Pong:", event.transactionHash);
    }
  });
};
