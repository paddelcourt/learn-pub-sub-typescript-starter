import amqp from "amqplib";
import { publishJSON } from "../internal/pubsub/publish.js";
import { ExchangePerilDirect, PauseKey} from "../internal/routing/routing.js";
import type { PlayingState } from "../internal/gamelogic/gamestate.js";
import { getInput, printServerHelp } from "../internal/gamelogic/gamelogic.js";
import { declareAndBind, SimpleQueueType } from "../internal/pubsub/consume.js";
import { ExchangePerilTopic } from "../internal/routing/routing.js";
import { GameLogSlug } from "../internal/routing/routing.js";


async function main() {
  const rabbitConnString = "amqp://guest:guest@localhost:5672/";
  const conn = await amqp.connect(rabbitConnString);
  console.log("Connection Succesful!")
  console.log("Starting Peril server...");
  const confirmChannel = await conn.createConfirmChannel()
  await declareAndBind(conn, ExchangePerilTopic, GameLogSlug, `${GameLogSlug}.*`, SimpleQueueType.Durable, "topic")
  let value: PlayingState = {isPaused: true}
  process.on('SIGINT', () => {
      console.log('Program is shutting down');
      conn.close()
  }); 
  printServerHelp()
  while(true) { 
    const userInput = await getInput()
    if (userInput.length === 0) {
      continue;
    }
    const firstWord = userInput[0]
    if (firstWord === "pause") {
      console.log("pause messaging is being sent")
      value = { isPaused: true }
      const result = await publishJSON(confirmChannel, ExchangePerilDirect, PauseKey, value) 
    }
    else if (firstWord === "resume") { 
      console.log("resume messaging is being sent")
      value = {isPaused: false}
      const result = await publishJSON(confirmChannel, ExchangePerilDirect, PauseKey, value) 
    }

    else if (firstWord === "spawn") {

    }

    else if (firstWord === "quit") { 
      console.log("exiting")
      break
    }

    else {
      console.log("command doesn't exist")
    }
    
    
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});


