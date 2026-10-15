import amqp from "amqplib";
import { publishJSON } from "../internal/pubsub/publish.js";
import { ExchangePerilDirect, ExchangePerilTopic, PauseKey} from "../internal/routing/routing.js";
import type { PlayingState } from "../internal/gamelogic/gamestate.js";
import { clientWelcome, commandStatus } from "../internal/gamelogic/gamelogic.js";
import { declareAndBind, SimpleQueueType } from "../internal/pubsub/consume.js";
import { GameState } from "../internal/gamelogic/gamestate.js";
import { commandSpawn } from "../internal/gamelogic/spawn.js";
import { getInput } from "../internal/gamelogic/gamelogic.js";
import { commandMove } from "../internal/gamelogic/move.js";
import { printClientHelp } from "../internal/gamelogic/gamelogic.js";
import { subscribeJSON } from "../internal/pubsub/consume.js";
import { handlerPause } from "./handlers.js";
import { handlerMove } from "./handlers.js";


async function main() {
  const rabbitConnString = "amqp://guest:guest@localhost:5672/";
  console.log("Starting Peril client...");
  const conn = await amqp.connect(rabbitConnString);
  console.log("Connection Succesful!")
  const confirmChannel = await conn.createConfirmChannel()
  const value: PlayingState = {isPaused: true}
  const clientName = await clientWelcome()
  const result = await publishJSON(confirmChannel, ExchangePerilDirect, PauseKey, value)
  const gameState = new GameState(clientName)
  await subscribeJSON(conn, ExchangePerilDirect,  `pause.${clientName}`, PauseKey, SimpleQueueType.Transient, handlerPause(gameState))
  await subscribeJSON(conn, ExchangePerilTopic,  `army_moves.${clientName}`, `army_moves.*`, SimpleQueueType.Transient, handlerMove(gameState), "topic")
  while (true) {
    const words = await getInput()
    if (words.length === 0) continue;

    if (words[0] === "spawn") {
      try {
      commandSpawn(gameState, words)
    }
    catch (error) {
      console.error(error)
    }

    }
    else if (words[0] === "move") {
      try {
      const moveResult = commandMove(gameState, words)
      await publishJSON(confirmChannel, ExchangePerilTopic, `army_moves.${clientName}`, moveResult)
      console.log("move was successfully published")
    }
    catch (error) {
      console.error(error)
    }

    }
    else if (words[0] === "status") {
      try {
      commandStatus(gameState)
    }
    catch (error) {
      console.error(error)
    }

    }

    else if (words[0] === "help") {
      printClientHelp()
    }

    else if (words[0] === "spam") {
      console.log("Spamming not allowed yet")
    }

    else if (words[0] === "spam") {
      console.log("Spamming not allowed yet")
    }

    else if (words[0] === "quit") {
      break
    }
    
    

  }
  process.on('SIGINT', () => {
  console.log('Program is shutting down');
  conn.close()
  }); 
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

