import express from "express";
import Alexa, { SkillBuilders } from "ask-sdk-core";
import morgan from "morgan";
import { ExpressAdapter } from "ask-sdk-express-adapter";
import mongoose from "mongoose";
import { Schema } from "mongoose";

mongoose.connect(
  `mongodb+srv://abdalshakir:mainnahibataunga715715@cluster0.6i9n6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
);

const usageSchema = new Schema({
  skillName: String,
  clientName: String,
  createdOn: { type: Date, default: Date.now },
});

const Usage = mongoose.model("Usage", usageSchema);

const app = express();
app.use(morgan("dev"));
const PORT = process.env.PORT || 3000;

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput =
      "Fallback intent: Sorry, I had trouble doing what you asked. Please try again.";
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
      var newUsage = new Usage({
          skillName: 'Food ordering skill',
          clientName: 'Abdal Shakir'
      }).save();
      
    const speakOutput = "Welcome to my food ordering app";
    const reprompt = "I am your virtual assistant. You can ask for the menu";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(reprompt)
      .withSimpleCard("Kababjees", speakOutput)
      .getResponse();
  },
};

const IntroHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "Intro"
    );
  },
  handle(handlerInput) {
    const speakOutput = "Hello";
    const reprompt = "Hello";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(reprompt)
      .getResponse();
  },
};

const skillBuilder = SkillBuilders.custom()
  .addRequestHandlers(LaunchRequestHandler, IntroHandler)
  .addErrorHandlers(ErrorHandler);
const skill = skillBuilder.create();
const adapter = new ExpressAdapter(skill, false, false);

app.post("/api/v1/webhook-alexa", adapter.getRequestHandlers());

app.use(express.json());
app.get("/profile", (req, res, next) => {
  res.send("This is my profile");
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
