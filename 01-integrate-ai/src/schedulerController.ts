import { Request, Response } from "express";
import { aiClient } from "./openai";
import { aiResponseSchema, generateSchedulePayload } from "./schemas";

const systemMessage = `
  You are a scheduler assistant that helps users plan their tasks for the day.

  You have a few specific rules to follow when creating the user's schedule:

  - You can not schedule tasks during blocks that the user has a predefined event
  - Estimate a duration to each task and create time blocks for each task item
  - Make higher priority tasks happen earlier in the day if possible.
  - Only schedule tasks between the times of 8am - 6pm

  Return the response in JSON format as defined below. Sort the array of items by startTime.

  {
    "dailyTasksAndEvents": [{
      "name": "the name of the event",
      "startTime": "the start time of the event",
      "endTime": "the end time of the event"
    }]
  }
`;

export const generateSchedule = async (req: Request, res: Response) => {
  try {
    const payload = generateSchedulePayload.parse(req.body);

    const generateListPrompt = `
      Generate a todo list for the day, following the rules defined in the system message.

      The user's predefined events are delimited by triple quotes

      """
      ${JSON.stringify(payload.scheduledEvents)}
      """

      The user's task list for today are delimited by triple exclamation points

      !!!
      ${JSON.stringify(payload.todoItems)}
      !!!
    `;

    const response = await aiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: generateListPrompt,
        },
      ],
      response_format: {
        type: "json_object",
      },
    });

    const responseWithHistory = await aiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: generateListPrompt,
        },
        {
          role: "assistant",
          content: response.choices[0].message.content,
        },
        {
          role: "user",
          content: `
          Factor in the user's previous days of tasks which is delimited by triple question marks

          Use the following rules when incorporating todo history into today's tasks and events:
            - Tasks that are marked incomplete, should be prioritized to be done today
            - The further away the task is from today, the higher priority it is
            - Analyze the schedules of the past few days for a more optimized schedule for today
            - Did the user not complete everything? You are then scheduling too much and should reduce the amount of tasks for today.
            - Did the user complete everything? You are scheduling too little and should get the user more to do today.



            The user's task history is delimited by triple exclamation points

            !!!
            ${JSON.stringify(payload.todoHistory)}
            !!!
          `,
        },
      ],
      response_format: {
        type: "json_object",
      },
    });

    const message = JSON.parse(
      responseWithHistory.choices[0].message.content || "{}"
    );

    const parsedResponse = aiResponseSchema.parse(message);

    res.json({ message: parsedResponse });
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "something went wrong" });
  }
};
