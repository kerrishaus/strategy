// https://stackoverflow.com/a/12646864
// TODO: I don't want this to modify in place, I want it to return the shuffled array.
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}