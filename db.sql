--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-10-25 10:29:39 WIB

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 22372)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: testtodo
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO testtodo;

--
-- TOC entry 219 (class 1259 OID 22382)
-- Name: tasks; Type: TABLE; Schema: public; Owner: testtodo
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    description text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone,
    created_by text NOT NULL,
    deadline timestamp(3) without time zone,
    status boolean DEFAULT false NOT NULL,
    title text NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.tasks OWNER TO testtodo;

--
-- TOC entry 218 (class 1259 OID 22381)
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: testtodo
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO testtodo;

--
-- TOC entry 3736 (class 0 OID 0)
-- Dependencies: 218
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: testtodo
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- TOC entry 220 (class 1259 OID 22448)
-- Name: users; Type: TABLE; Schema: public; Owner: testtodo
--

CREATE TABLE public.users (
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone,
    id integer NOT NULL,
    image text,
    name character varying(255),
    username text NOT NULL
);


ALTER TABLE public.users OWNER TO testtodo;

--
-- TOC entry 221 (class 1259 OID 22483)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: testtodo
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO testtodo;

--
-- TOC entry 3737 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: testtodo
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3568 (class 2604 OID 22385)
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: testtodo
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- TOC entry 3572 (class 2604 OID 22484)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: testtodo
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3726 (class 0 OID 22372)
-- Dependencies: 217
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: testtodo
--

INSERT INTO public._prisma_migrations VALUES ('e9586e0b-412e-4465-bd5a-ce8fc7b8f470', 'dd0a25facc0a86cd049beaa53945d1788afe114bea187b2afeb70c8cce311c10', '2025-10-24 20:15:42.843373+07', '20250605063420_initial_table_task', NULL, NULL, '2025-10-24 20:15:42.840462+07', 1);
INSERT INTO public._prisma_migrations VALUES ('d9250f2e-49dd-4b13-8b24-5d211ab11e81', 'ecc58f99d42c1cf163fd407abfb24cc6b1be267069d4fde56fd2c08dbc6f3e2b', '2025-10-24 20:15:42.846886+07', '20250605065646_initial_table_user', NULL, NULL, '2025-10-24 20:15:42.843594+07', 1);
INSERT INTO public._prisma_migrations VALUES ('8fecc208-02ab-46e3-8833-5ccab7ae2af1', '9dbeecaa6cf44bc4eaf9063b4ade995a70f59c0cc6d155e7393a69cc685f8b76', '2025-10-24 20:15:42.851463+07', '20250605080608_init_schema', NULL, NULL, '2025-10-24 20:15:42.847156+07', 1);
INSERT INTO public._prisma_migrations VALUES ('4f0ec72c-5ca7-4b04-94f8-7f6e57ead91b', '04c5fc77599b37f6ef4e20079df430caa51edfc307c017a5e39fc4cc15ab4944', '2025-10-24 20:15:42.853779+07', '20250605084407_init_schema', NULL, NULL, '2025-10-24 20:15:42.851676+07', 1);
INSERT INTO public._prisma_migrations VALUES ('a20e4d6f-e285-4017-96cf-75fb8581f45a', '79962754c66232f622195679d9741fdbf5f1538db445dfe534a7bb71fcf335c2', '2025-10-24 20:15:42.856943+07', '20250605084907_initial_table_user', NULL, NULL, '2025-10-24 20:15:42.853977+07', 1);
INSERT INTO public._prisma_migrations VALUES ('e77fc444-2ed2-43a8-a180-28dbad284d36', 'c33c10a594eaf30783ac3a915a4a5aefc9aac02db427d62b9677599ccfdff90e', '2025-10-24 20:15:42.861465+07', '20250605085750_initial_table_user', NULL, NULL, '2025-10-24 20:15:42.85721+07', 1);
INSERT INTO public._prisma_migrations VALUES ('94d992cf-b0b6-492f-bc52-a5c863d0c21d', '21ceecafd9a5eea4d0990d33866697705454d4594418d719b6ad91cd35ec8908', '2025-10-24 20:15:42.86229+07', '20250605160405_initial_table_task', NULL, NULL, '2025-10-24 20:15:42.861666+07', 1);
INSERT INTO public._prisma_migrations VALUES ('4d7a3474-f022-428c-9cdb-51f60e966611', 'ccae0d4d3fc7c2877fc5624230777f9c8513c6b84d0df78a96c9239ae6eba462', '2025-10-24 20:15:42.862976+07', '20250605165247_update_table_user', NULL, NULL, '2025-10-24 20:15:42.862466+07', 1);
INSERT INTO public._prisma_migrations VALUES ('37dc83a0-b020-4fcc-a36e-c4c2d465be65', '0ec1eac55b94dd337a3adeb931662444d4d42903838116babe2e393f3ee89279', '2025-10-24 20:15:42.866764+07', '20250605165509_update_table_user', NULL, NULL, '2025-10-24 20:15:42.863158+07', 1);
INSERT INTO public._prisma_migrations VALUES ('f0e8da47-b867-4917-a0a9-ec659670be2e', 'd6ebac29fad16089529122cecf59ef245a39f5ff0061143f9933edcc4fdbb615', '2025-10-24 20:15:56.295956+07', '20251024131556_new_todo', NULL, NULL, '2025-10-24 20:15:56.285355+07', 1);


--
-- TOC entry 3728 (class 0 OID 22382)
-- Dependencies: 219
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: testtodo
--

INSERT INTO public.tasks VALUES (1, 'bababaa', '2025-10-25 00:02:23.233', '2025-10-25 00:02:23.233', 'gugu@mail.com', NULL, false, 'bababaa', 2);
INSERT INTO public.tasks VALUES (3, 'Write comprehensive documentation for the API', '2025-10-25 01:37:04.345', '2025-10-25 01:37:04.345', 'johndoe', NULL, false, 'Write comprehensive documentation for the API', 3);
INSERT INTO public.tasks VALUES (4, 'Updated task description', '2025-10-25 01:37:06.705', '2025-10-25 01:38:11.698', 'johndoe', '2025-12-31 23:59:59', true, 'Updated task title', 3);


--
-- TOC entry 3729 (class 0 OID 22448)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: testtodo
--

INSERT INTO public.users VALUES ('e4203bd692f3fc41cded5178f0d4943e:nHJAQZzQPe+EWLejRrNelg==', '2025-10-25 00:01:03.425', '2025-10-25 00:01:03.425', 2, NULL, 'Bejo hyura', 'gugu@mail.com');
INSERT INTO public.users VALUES ('497c3b8729be5f2024a6a383ea9226b7:HCxQnFTKZ6buRtF+1qKlag==', '2025-10-25 01:36:28.661', '2025-10-25 01:36:28.661', 3, NULL, 'John Doe', 'johndoe');


--
-- TOC entry 3738 (class 0 OID 0)
-- Dependencies: 218
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: testtodo
--

SELECT pg_catalog.setval('public.tasks_id_seq', 4, true);


--
-- TOC entry 3739 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: testtodo
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- TOC entry 3574 (class 2606 OID 22380)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: testtodo
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3576 (class 2606 OID 22391)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: testtodo
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 3578 (class 2606 OID 22486)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: testtodo
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3579 (class 1259 OID 22633)
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: testtodo
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- TOC entry 3580 (class 2606 OID 22634)
-- Name: tasks tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: testtodo
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2025-10-25 10:29:39 WIB

--
-- PostgreSQL database dump complete
--

