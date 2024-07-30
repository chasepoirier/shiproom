import zod from "zod";

export const aiResponseSchema = zod.object({
  dailyTasksAndEvents: zod.array(
    zod.object({
      name: zod.string(),
      startTime: zod.string().default("unset"),
      endTime: zod.string().default("unset"),
    })
  ),
});

export const generateSchedulePayload = zod.object({
  scheduledEvents: zod.array(
    zod.object({
      name: zod.string(),
      startTime: zod.string(),
      endTime: zod.string(),
    })
  ),
  todoItems: zod.array(zod.string()),
  todoHistory: zod.array(
    zod.object({
      day: zod.string(),
      todos: zod.array(
        zod.object({
          name: zod.string(),
          startTime: zod.string(),
          endTime: zod.string(),
          completed: zod.boolean(),
        })
      ),
    })
  ),
});
