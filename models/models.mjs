export const Models = {
  Group: `CREATE TABLE IF NOT EXISTS "googleTelegram_bot"."Group"
  (
      "Name" text COLLATE pg_catalog."default" NOT NULL,
      CONSTRAINT "Group_pkey" PRIMARY KEY ("Name")
  );`,
  User: `CREATE TABLE IF NOT EXISTS "googleTelegram_bot"."User"
  (
      "Id" bigint NOT NULL,
      "Group" text NOT NULL,
      "Name" text COLLATE pg_catalog."default" NOT NULL,
      "createdDate" date NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "UserFolder" text COLLATE pg_catalog."default",
      CONSTRAINT "User_pkey" PRIMARY KEY ("Id"),
      CONSTRAINT "GroupUser_Group_fkey" FOREIGN KEY ("Group")
          REFERENCES "googleTelegram_bot"."Group" ("Name") MATCH SIMPLE
          ON UPDATE CASCADE
          ON DELETE CASCADE
  );`,
  PhotoFolder: `CREATE TABLE IF NOT EXISTS "googleTelegram_bot"."PhotoFolder"
  (
      "UserId" integer NOT NULL,
      "FolderId" text COLLATE pg_catalog."default" NOT NULL,
      "СreationDate" date NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PhotoFolder_pkey" PRIMARY KEY ("UserId", "СreationDate"),
      CONSTRAINT "PhotoFolder_UserId_fkey" FOREIGN KEY ("UserId")
          REFERENCES "googleTelegram_bot"."User" ("Id") MATCH SIMPLE
          ON UPDATE CASCADE
          ON DELETE CASCADE
  );`,
  Question: `CREATE TABLE IF NOT EXISTS "googleTelegram_bot"."Question"
  (
      "Id" BIGSERIAL NOT NULL,
      "Group" text NOT NULL,
      "Name" text COLLATE pg_catalog."default" NOT NULL,
      "Text" text COLLATE pg_catalog."default" NOT NULL,
      "Require" boolean NOT NULL DEFAULT false,
      CONSTRAINT "Question_pkey" PRIMARY KEY ("Id")
  );`,
}
