-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.goals (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id text,
  text text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT goals_pkey PRIMARY KEY (id)
);
CREATE TABLE public.habit_entries (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  habit_id bigint NOT NULL,
  date date NOT NULL,
  user_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT habit_entries_pkey PRIMARY KEY (id),
  CONSTRAINT habit_entries_habit_id_fkey FOREIGN KEY (habit_id) REFERENCES public.habits(id)
);
CREATE TABLE public.habits (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  text text,
  done boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid,
  CONSTRAINT habits_pkey PRIMARY KEY (id),
  CONSTRAINT habits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
