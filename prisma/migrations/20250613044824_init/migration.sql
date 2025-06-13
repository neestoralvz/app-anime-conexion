-- CreateTable
CREATE TABLE "animes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "year" INTEGER,
    "image_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "phase" TEXT NOT NULL DEFAULT 'SELECTION',
    "maxUsers" INTEGER NOT NULL DEFAULT 2,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "session_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "is_ready" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "session_users_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "selections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "anime_id" TEXT NOT NULL,
    "order_num" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "selections_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "selections_session_id_user_id_fkey" FOREIGN KEY ("session_id", "user_id") REFERENCES "session_users" ("session_id", "user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "selections_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "animes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "anime_id" TEXT NOT NULL,
    "question_1" INTEGER NOT NULL,
    "question_2" INTEGER NOT NULL,
    "question_3" INTEGER NOT NULL,
    "is_self" BOOLEAN NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ratings_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ratings_session_id_user_id_fkey" FOREIGN KEY ("session_id", "user_id") REFERENCES "session_users" ("session_id", "user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ratings_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "animes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_code_key" ON "sessions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "session_users_session_id_user_id_key" ON "session_users"("session_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "selections_session_id_user_id_order_num_key" ON "selections"("session_id", "user_id", "order_num");

-- CreateIndex
CREATE UNIQUE INDEX "selections_session_id_user_id_anime_id_key" ON "selections"("session_id", "user_id", "anime_id");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_session_id_user_id_anime_id_is_self_key" ON "ratings"("session_id", "user_id", "anime_id", "is_self");
