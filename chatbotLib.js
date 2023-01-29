/**
 * Always only 2 participants in the chat: human and chatbot.
 * A chat array can be quickly created in code for testing.
 * A chat array always starts with human first and then the next element is
 * the response of the chatbot. So if the chatbot was thinking while the human
 * typed another message, then the combined message from the human must be
 * stored as a single element in the array.
 *
 * A chat transcript is string form is prefixed by 'human: ' and 'chatbot: ' in
 * order to clarify who said what. Currently, there is no escape sequence for
 * these two strings, when generating or parsing the string form of the chat
 * transcript. 'human: ' and 'chatbot: ' will of course, always start on a new
 * line.
 *
 * Leading and Trailing whitespace in a chat message is ignored, and will be
 * removed by various functions below.
 */

/**
 * Converts a chat array (as defined at the start of this file) into a chat
 * transcript.
 * @param {string[]} chatArray
 *@returns {string}
 */
export function chatArrayToTranscript(chatArray) {
  let transcript = "";
  let isHuman = false;
  for (const chatMessage of chatArray) {
    isHuman = !isHuman;
    transcript +=
      (isHuman ? "human: " : "chatbot: ") + chatMessage.trim() + "\n";
  }
  return transcript;
}

/**
 * @typedef {Object} ChatTrainingExamplesAndQuery
 * @property {string[][]} trainingExamples ;
 * @property {string} [query] The next chat message from the human, for which
 * the chatbot ML model needs to predict the response
 */

/**
 * Converts a array that represents a chat dialog that follows the constraints
 * mentioned at the top of this file, into a set of training examples for ML.
 * If the chat array ends with a message from a human, then this message is not
 * considered as part of the training examples. Rather it is considered as a
 * query whose value is to be predicted based on the ML done on the training
 * examples.
 * @param {string[]} chatArray
 * @return {ChatTrainingExamplesAndQuery}
 */
export function chatArrayToTrainingExamplesAndQuery(chatArray) {
  /** @type {string[][]} */
  const trainingExamples = [];
  /**
   * @type {ChatTrainingExamplesAndQuery}
   */
  const output = { trainingExamples };
  let transcript = "";
  let isHuman = false;
  let idx = -1;
  for (const chatMessage of chatArray) {
    idx++;
    isHuman = !isHuman;
    if (transcript !== "" && !isHuman) {
      //We have a non-empty chat transcript. The last message in that transcript
      //was the human's message, and so the current message is the chatbot's
      //response:
      const trainingExample = [transcript.trim(), chatMessage.trim()];
      trainingExamples.push(trainingExample);
    }
    transcript +=
      (isHuman ? "human: " : "chatbot: ") + chatMessage.trim() + "\n";
    if (isHuman && idx === chatArray.length - 1) {
      output.query = transcript.trim();
    }
  }
  return output;
}

/**
 * @param {string} chatTranscript
 */
export function chatTranscriptToTrainingExamplesAndQuery(chatTranscript) {
  const chatArray = chatTranscriptToArray(chatTranscript);
  return chatArrayToTrainingExamplesAndQuery(chatArray);
}

/**
 * @param {string} chatTranscript
 * @returns {string[]}
 */
export function chatTranscriptToArray(chatTranscript) {
  if (chatTranscript.trim() == "") {
    return [];
  }
  assert(chatTranscript.startsWith("human: "));

  // Otherwise the split function will create first element as blank string!
  chatTranscript = chatTranscript.substring("human: ".length);

  const uniqueToken = uniqueTokenNotIn(chatTranscript);
  chatTranscript = chatTranscript.replaceAll("human: ", uniqueToken);
  chatTranscript = chatTranscript.replaceAll("chatbot: ", uniqueToken);
  const output = chatTranscript.split(uniqueToken);
  for (let i = 0; i < output.length; i++) {
    output[i] = output[i].trim();
  }
  return output;
}

/**
 * @param {boolean} condition
 */
function assert(condition) {
  if (!condition) {
    throw new Error("assertion failed");
  }
}

/**
 * @param {string } s
 */
function uniqueTokenNotIn(s) {
  assert(s != "");
  let uniqueToken = 0;
  while (s.includes("" + uniqueToken)) {
    uniqueToken++;
  }
  return "" + uniqueToken;
}
