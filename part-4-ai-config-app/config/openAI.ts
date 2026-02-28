
import OpenAI from "openai";

let openaiClient: OpenAI;

export const getOpenAI = () => {
    if(!openaiClient) {
        openaiClient = new OpenAI();
    }
    return openaiClient;
}
