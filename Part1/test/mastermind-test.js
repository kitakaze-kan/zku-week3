//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;
const buildPoseidon = require("circomlibjs").buildPoseidon;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

describe("MastermindVariation test", function () {
    this.timeout(100000000);
    let poseidon;
    let pubHash;
    const salt = "12345"
    const Soln = { 
        "privSolnA": 2,
        "privSolnB": 3,
        "privSolnC": 5
    }

    before( async () => {
        poseidon = await buildPoseidon();
        F = poseidon.F;
        pubHash = poseidon([salt,2,3,5,5]);
    });

    it("MastermindVariation success", async () => {
        const circuit = await wasm_tester("./contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        const answer = {
            "pubGuessA": 2,
            "pubGuessB": 3,
            "pubGuessC": 5,
            "pubNumHit": 3,
            "pubNumBlow": 0,
            "pubSolnHash": F.toObject(pubHash).toString(),
        }

        console.log("Soln", Soln)
        console.log("answer", answer)

        const INPUT = Object.assign(answer, Soln, {privSalt: salt})

        const witness = await circuit.calculateWitness(INPUT, true);

        await circuit.assertOut(witness, {solnHashOut : F.toObject(pubHash)});
    });
});