
enum GuessType {
	skip = "SKIP",
	incorrect = "INCORRECT"
}

export type Guess = {

	type: "SKIP" | "INCORRECT" | GuessType
	submission?: string
}
