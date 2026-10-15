import type { PlayingState, GameState } from "../internal/gamelogic/gamestate.js";
import { handlePause } from "../internal/gamelogic/pause.js";
import { handleMove } from "../internal/gamelogic/move.js";
import type { ArmyMove } from "../internal/gamelogic/gamedata.js";


export function handlerPause(gs: GameState): (ps: PlayingState) => void {
    return function(ps: PlayingState) {
        handlePause(gs, ps)
        process.stdout.write("> ") 
    }
}

export function handlerMove(gs: GameState): (move: ArmyMove) => void {
    return function(move: ArmyMove) {
        handleMove(gs, move)
        process.stdout.write("> ")
    }
}