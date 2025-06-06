import { config } from "dotenv";
import axios from "axios";
import Period from "./enums/Period";
import Candle from "./model/Candle";
import { Console } from "console";
import { createMessageChannel } from "./messages/messageChannel";

config();

const readMarketPrice = async (): Promise<number> => {
  const result = await axios.get(process.env.PRICES_API!);
  const data = result.data;
  const price = data.bitcoin.usd;
  console.log(price);
  return price;
};

const generateCandles = async () => {
  const messageChannel = await createMessageChannel();

  if (messageChannel) {
    while (true) {
      const loopTimes = Period.ONE_MINUTE / Period.TEN_SECONDS;
      const candle = new Candle("BTC");

      for (let i = 0; i < loopTimes; i++) {
        const price = await readMarketPrice();
        candle.addValue(price);
        console.log(`Market price #${i + 1} of ${loopTimes}`);
        await new Promise((r) => setTimeout(r, Period.TEN_SECONDS));
      }

      candle.closeCandle();
      console.log("Candle close");
      console.log(candle.toSimpleObject());
      const candleObj = candle.toSimpleObject();
      console.log(candleObj);
      const candleJson = JSON.stringify(candleObj);
      messageChannel.sendToQueue(
        process.env.QUEUE_NAME,
        Buffer.from(candleJson)
      );
      console.log("Candle sent to queue");
    }
  }
};

generateCandles();
