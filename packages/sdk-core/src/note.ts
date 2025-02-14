import type { Backend, Curve, HashFunction, JsNote, NotePrefix } from "@webb-tools/wasm-utils";

export type NoteGenInput = {
  prefix: NotePrefix;
  version: string;
  chain: string;
  sourceChain: string;
  backend: Backend;
  hashFunction: HashFunction;
  curve: Curve;
  tokenSymbol: string;
  amount: string;
  denomination: string;
  secrets?: string;
  width: string;
  exponentiation: string;
};

export class Note {
  // Default constructor
  private constructor(readonly note: JsNote) {
  }

  private static get wasm() {
    return import("@webb-tools/wasm-utils");
  }

  public static async deserialize(value: string): Promise<Note> {
    const wasm = await Note.wasm;
    const depositNote = wasm.JsNote.deserialize(value);
    return new Note(depositNote);
  }

  async toDepositNote(): Promise<JsNote> {
    const wasm = await Note.wasm;
    return wasm.JsNote.deserialize(this.serialize());
  }

  public serialize(): string {
    return this.note.serialize();
  }

  getLeaf(): Uint8Array {
    return this.note.getLeafCommitment();
  }

  public static async generateNote(noteGenInput: NoteGenInput): Promise<Note> {
    const wasm = await Note.wasm;
    const noteBuilderInput = new wasm.JsNoteBuilder();
    noteBuilderInput.prefix(noteGenInput.prefix);
    noteBuilderInput.version("v1");
    noteBuilderInput.targetChainId(noteGenInput.chain);
    noteBuilderInput.sourceChainId(noteGenInput.sourceChain);
    noteBuilderInput.backend(noteGenInput.backend);
    noteBuilderInput.hashFunction(noteGenInput.hashFunction);
    noteBuilderInput.curve(noteGenInput.curve);
    noteBuilderInput.tokenSymbol(noteGenInput.tokenSymbol);
    noteBuilderInput.amount(noteGenInput.amount);
    noteBuilderInput.denomination(noteGenInput.denomination);
    noteBuilderInput.width(noteGenInput.width);
    noteBuilderInput.exponentiation(noteGenInput.exponentiation);
    if (noteGenInput.secrets) {
      noteBuilderInput.setSecrets(noteGenInput.secrets);
    }
    const depositNote = noteBuilderInput.build();
    return new Note(depositNote);
  }

}
