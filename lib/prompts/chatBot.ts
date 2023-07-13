import { ChatGPTMessage } from "../models";
import { ActionGroupJoinActions } from "../types";
import { OpenAPIV3_1 } from "openapi-types";

export default function getMessages(
  userCopilotMessages: ChatGPTMessage[],
  pageActions: ActionGroupJoinActions[],
  userDescription: string | undefined,
  currentPageName: string,
  orgInfo: {
    name: string;
    description: string;
  },
  language: string
): ChatGPTMessage[] {
  const currentPage = pageActions.find((p) => p.name === currentPageName);

  let userDescriptionSection = "";
  if (userDescription) {
    userDescriptionSection = `\nThe following is a description of the user and instructions on how you should address them - it's important that you take notice of this. ${userDescription}\n`;
  }

  if (!currentPage) {
    throw new Error(
      `Page ${currentPageName} not found in pageActions ${JSON.stringify(
        pageActions
      )}`
    );
  }
  const otherPages = pageActions.filter((p) => p.name !== currentPageName);
  const availablePages = otherPages
    .map(
      (pageAction) => "\n- '" + pageAction.name + "': " + pageAction.description
    )
    .join("");
  let i = 1;
  let numberedActions = "";
  if (availablePages.length > 0) {
    i++;
    numberedActions += `1. navigateTo: This will navigate you to another page. This enables you to use functions that are available on that page. Available pages (in format "- 'page-name': description") are: ${availablePages}. PARAMETERS: - pageName (string): The name of the page you want to navigate to. REQUIRED\n`;
  }
  currentPage.actions.forEach((action) => {
    let paramString = "";
    // For parameters
    if (action.parameters && Array.isArray(action.parameters)) {
      action.parameters.forEach((param) => {
        const p = param as unknown as OpenAPIV3_1.ParameterObject;
        const schema = p.schema as OpenAPIV3_1.SchemaObject;
        const enums = schema.enum;
        // TODO: Deal with very long enums better - right now we are just ignoring them
        paramString += `\n- ${p.name} (${schema.type}${
          enums && enums.length < 20 ? `: ${enums}` : ""
        })${p.description ? `: ${p.description}` : ""}. ${
          p.required ? "REQUIRED" : ""
        }`;
      });
    }
    if (
      action.request_body_contents &&
      typeof action.request_body_contents === "object" &&
      // TODO: Content-types other than application/json aren't supported
      "application/json" in action.request_body_contents
    ) {
      const body = action.request_body_contents["application/json"];

      // @ts-ignore
      const properties = body.schema.properties as {
        [name: string]: OpenAPIV3_1.SchemaObject;
      };

      const required =
        ((body as { schema: any })?.schema?.required as string[]) ?? null;

      Object.entries(properties).forEach(([key, value]) => {
        // Throw out readonly attributes
        if (value.readOnly) return;
        const enums = value.enum;
        // TODO: Deal with very long enums better - right now we are just ignoring them
        paramString += `\n- ${key} (${value.type}${
          enums && enums.length < 20 ? `: ${enums}` : ""
        })${value.description ? `: ${value.description}` : ""} ${
          required && required.includes(key) ? "REQUIRED" : ""
        }`;
      });
    }
    numberedActions += `${i}. ${action.name}: ${action.description}.${
      paramString ? " PARAMETERS: " + paramString : ""
    }\n`;
    i++;
  });
  return [
    {
      role: "system",
      content: `You are ${orgInfo.name} chatbot AI. ${
        orgInfo.description
      } Your role is to be helpful to the user. Help them achieve tasks in ${
        orgInfo.name
      } by calling functions.

Seek user assistance when necessary or more information is required.

Do not instruct the user to perform actions. Instead, perform the actions yourself by calling functions in the "commands" output. Output commands in the order you want them to be performed.
${userDescriptionSection}
The date today is ${new Date().toISOString().split("T")[0]}.

You are currently on the ${currentPageName} page. The functions available are determined by the page you're on. Sometimes, to access a function, you will need to navigate to a new page to be able to see the function definition. In such cases, stop outputting commands when you navigate to the correct page.

You MUST exclusively use the functions listed below in the "commands" output. THIS IS VERY IMPORTANT! DO NOT FORGET THIS!
These are formatted with {{NAME}}: {{DESCRIPTION}}. PARAMETERS: {{PARAMETERS}}. Each parameter is formatted like: "- {{NAME}} ({{DATATYPE}}: [{{POSSIBLE_VALUES}}]): {{DESCRIPTION}}. {{"REQUIRED" if parameter required}}".
${numberedActions}

If you need to use the output of a previous command for a command, simply stop outputting commands and set "Completed: false" - you will be asked once the function has returned for your next step.

Aim to complete the task in the smallest number of steps. Be as concise as possible in your responses. 

Think and talk to the user in the following language: ${language}. This should ONLY affect the Reasoning, Plan & Tell user outputs. NOT the commands or completed.

Think step-by-step. Respond following the format below, starting with your thoughts (your Reasoning & Plan), optionally anything to tell the user "Tell user", then optionally any "Commands" (you can call multiple, separate with a newline), then whether you are "Completed". THIS IS VERY IMPORTANT! DO NOT FORGET THIS!

Reasoning: reasoning behind the plan. Be concise. If the task isn't possible, or you need more information from the user, ask here and then skip the plan and commands entirely.

Plan:
- short bulleted
- list that conveys
- long-term plan

Tell user: (optional) tell the user something. E.g. if you're answering a question, write the answer to the user here.

Commands: (optional)
FUNCTION_NAME_1(PARAM_NAME_1=PARAM_VALUE_1, PARAM_NAME_2=PARAM_VALUE_2, ...)

Completed: (true or false or question) set to true when the above commands, when executed, would achieve the task set by the user. Alternatively, if the task isn't possible and you need to ask a clarifying question, set to question. THIS IS VERY IMPORTANT! DO NOT FORGET THIS!`,
    },
    ...userCopilotMessages,
  ];
}