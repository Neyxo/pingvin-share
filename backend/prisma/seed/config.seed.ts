import { Prisma, PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const configVariables: Prisma.ConfigCreateInput[] = [
  {
    key: "SETUP_FINISHED",
    description: "Whether the setup has been finished",
    type: "boolean",
    value: "false",
    secret: false,
    locked: true,
  },
  {
    key: "APP_URL",
    description: "On which URL Pingvin Share is available",
    type: "string",
    value: "http://localhost:3000",
    secret: false,
  },
  {
    key: "SHOW_HOME_PAGE",
    description: "Whether to show the home page",
    type: "boolean",
    value: "true",
    secret: false,
  },
  {
    key: "ALLOW_REGISTRATION",
    description: "Whether registration is allowed",
    type: "boolean",
    value: "true",
    secret: false,
  },
  {
    key: "ALLOW_UNAUTHENTICATED_SHARES",
    description: "Whether unauthorized users can create shares",
    type: "boolean",
    value: "false",
    secret: false,
  },
  {
    key: "MAX_FILE_SIZE",
    description: "Maximum file size in bytes",
    type: "number",
    value: "1000000000",
    secret: false,
  },
  {
    key: "JWT_SECRET",
    description: "Long random string used to sign JWT tokens",
    type: "string",
    value: crypto.randomBytes(256).toString("base64"),
    locked: true,
  },
  {
    key: "ENABLE_EMAIL_RECIPIENTS",
    description:
      "Whether to send emails to recipients. Only set this to true if you entered the host, port, email, user and password of your SMTP server.",
    type: "boolean",
    value: "false",
    secret: false,
  },
  {
    key: "SMTP_HOST",
    description: "Host of the SMTP server",
    type: "string",
    value: "",
  },
  {
    key: "SMTP_PORT",
    description: "Port of the SMTP server",
    type: "number",
    value: "",
  },
  {
    key: "SMTP_EMAIL",
    description: "Email address which the emails get sent from",
    type: "string",
    value: "",
  },
  {
    key: "SMTP_USERNAME",
    description: "Username of the SMTP server",
    type: "string",
    value: "",
  },
  {
    key: "SMTP_PASSWORD",
    description: "Password of the SMTP server",
    type: "string",
    value: "",
    obscured: true,
  },
];

const prisma = new PrismaClient();

async function main() {
  for (const variable of configVariables) {
    const existingConfigVariable = await prisma.config.findUnique({
      where: { key: variable.key },
    });

    // Create a new config variable if it doesn't exist
    if (!existingConfigVariable) {
      await prisma.config.create({
        data: variable,
      });
    }
  }

  const configVariablesFromDatabase = await prisma.config.findMany();

  // Delete the config variable if it doesn't exist anymore
  for (const configVariableFromDatabase of configVariablesFromDatabase) {
    const configVariable = configVariables.find(
      (v) => v.key == configVariableFromDatabase.key
    );
    if (!configVariable) {
      await prisma.config.delete({
        where: { key: configVariableFromDatabase.key },
      });

      // Update the config variable if the metadata changed
    } else if (
      JSON.stringify({
        ...configVariable,
        key: configVariableFromDatabase.key,
        value: configVariableFromDatabase.value,
      }) != JSON.stringify(configVariableFromDatabase)
    ) {
      await prisma.config.update({
        where: { key: configVariableFromDatabase.key },
        data: {
          ...configVariable,
          key: configVariableFromDatabase.key,
          value: configVariableFromDatabase.value,
        },
      });
    }
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
