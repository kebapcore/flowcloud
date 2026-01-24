CREATE TABLE "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"parent_id" integer,
	"path" text DEFAULT '/' NOT NULL,
	"size" text NOT NULL,
	"access_key" text,
	"created_at" timestamp DEFAULT now()
);
