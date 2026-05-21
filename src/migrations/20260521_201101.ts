import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const statements = [

    // --- Add 'zh' locale to _locales enum ---
    `ALTER TYPE "_locales" ADD VALUE IF NOT EXISTS 'zh'`,

    // --- Add 'zh' to published_locale enums ---
    `ALTER TYPE "enum__pages_v_published_locale" ADD VALUE IF NOT EXISTS 'zh'`,
    `ALTER TYPE "enum__posts_v_published_locale" ADD VALUE IF NOT EXISTS 'zh'`,

    // --- New ENUM types (only created if missing) ---
    `DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_testimonial_rating" AS ENUM('1', '2', '3', '4', '5');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_testimonial_layout" AS ENUM('centered', 'left', 'card');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_gallery_layout" AS ENUM('grid', 'masonry', 'slider');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_gallery_columns" AS ENUM('2', '3', '4', '5');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_contact_contact_info_type" AS ENUM('email', 'phone', 'address', 'social');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_contact_form_fields_field_type" AS ENUM('text', 'email', 'textarea', 'select', 'checkbox');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_contact_layout" AS ENUM('split', 'form-first', 'info-first');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_hero_background_type" AS ENUM('images', 'video');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum__pages_v_blocks_testimonial_rating" AS ENUM('1', '2', '3', '4', '5');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum__pages_v_blocks_testimonial_layout" AS ENUM('centered', 'left', 'card');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum__pages_v_blocks_gallery_layout" AS ENUM('grid', 'masonry', 'slider');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum__pages_v_blocks_gallery_columns" AS ENUM('2', '3', '4', '5');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum__pages_v_blocks_contact_contact_info_type" AS ENUM('email', 'phone', 'address', 'social');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum__pages_v_blocks_contact_form_fields_field_type" AS ENUM('text', 'email', 'textarea', 'select', 'checkbox');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum__pages_v_blocks_contact_layout" AS ENUM('split', 'form-first', 'info-first');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum__pages_v_version_hero_background_type" AS ENUM('images', 'video');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum_header_nav_items_sub_items_link_type" AS ENUM('reference', 'custom');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_info_cards_cards_link_type" AS ENUM('reference', 'custom');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_info_cards_cards_style" AS ENUM('default', 'highlight');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_blocks_logo_carousel_background_color" AS ENUM('white', 'gray');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum__pages_v_blocks_info_cards_cards_link_type" AS ENUM('reference', 'custom');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum__pages_v_blocks_info_cards_cards_style" AS ENUM('default', 'highlight');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,
    `DO $$ BEGIN
      CREATE TYPE "public"."enum__pages_v_blocks_logo_carousel_background_color" AS ENUM('white', 'gray');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;`,

    // --- New block tables for FAQ ---
    `CREATE TABLE IF NOT EXISTS "pages_blocks_faq_questions" ("_order" integer NOT NULL, "_parent_id" varchar NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "question" varchar, "answer" varchar, "default_open" boolean DEFAULT false)`,
    `CREATE TABLE IF NOT EXISTS "pages_blocks_faq" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "title" varchar, "description" varchar, "block_name" varchar)`,

    // --- New block tables for Gallery ---
    `CREATE TABLE IF NOT EXISTS "pages_blocks_gallery_images" ("_order" integer NOT NULL, "_parent_id" varchar NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "image_id" integer, "caption" varchar, "description" varchar)`,
    `CREATE TABLE IF NOT EXISTS "pages_blocks_gallery" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "title" varchar, "subtitle" varchar, "layout" "enum_pages_blocks_gallery_layout" DEFAULT 'grid', "columns" "enum_pages_blocks_gallery_columns" DEFAULT '3', "enable_lightbox" boolean DEFAULT true, "show_captions" boolean DEFAULT true, "block_name" varchar)`,

    // --- New block tables for Testimonial ---
    `CREATE TABLE IF NOT EXISTS "pages_blocks_testimonial" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "quote" varchar, "author" varchar, "role" varchar, "company" varchar, "avatar_id" integer, "rating" "enum_pages_blocks_testimonial_rating" DEFAULT '5', "layout" "enum_pages_blocks_testimonial_layout" DEFAULT 'centered', "block_name" varchar)`,

    // --- New block tables for Contact ---
    `CREATE TABLE IF NOT EXISTS "pages_blocks_contact_contact_info" ("_order" integer NOT NULL, "_parent_id" varchar NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "type" "enum_pages_blocks_contact_contact_info_type", "label" varchar, "value" varchar, "icon" varchar, "link" varchar)`,
    `CREATE TABLE IF NOT EXISTS "pages_blocks_contact_form_fields" ("_order" integer NOT NULL, "_parent_id" varchar NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "field_type" "enum_pages_blocks_contact_form_fields_field_type", "label" varchar, "name" varchar, "placeholder" varchar, "required" boolean DEFAULT false)`,
    `CREATE TABLE IF NOT EXISTS "pages_blocks_contact" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "title" varchar, "subtitle" varchar, "show_map" boolean DEFAULT false, "map_embed_code" varchar, "layout" "enum_pages_blocks_contact_layout" DEFAULT 'split', "block_name" varchar)`,

    // --- New columns on existing tables ---
    `ALTER TABLE "pages_blocks_content_columns" ADD COLUMN IF NOT EXISTS "image_id" integer`,
    `ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN IF NOT EXISTS "image_id" integer`,
    `ALTER TABLE "pages_blocks_logo_carousel_logos" ADD COLUMN IF NOT EXISTS "new_tab" boolean DEFAULT true`,
    `ALTER TABLE "_pages_v_blocks_logo_carousel_logos" ADD COLUMN IF NOT EXISTS "new_tab" boolean DEFAULT true`,

    // --- Hero locale fields ---
    `ALTER TABLE "pages_locales" ADD COLUMN IF NOT EXISTS "hero_background_type" "enum_pages_hero_background_type" DEFAULT 'images'`,
    `ALTER TABLE "pages_locales" ADD COLUMN IF NOT EXISTS "hero_youtube_video_url" varchar`,
    `ALTER TABLE "pages_locales" ADD COLUMN IF NOT EXISTS "hero_departure_tab" varchar DEFAULT 'UCHIB KETISH'`,
    `ALTER TABLE "pages_locales" ADD COLUMN IF NOT EXISTS "hero_arrival_tab" varchar DEFAULT 'QO''NIB KELISH'`,
    `ALTER TABLE "pages_locales" ADD COLUMN IF NOT EXISTS "hero_destination_label" varchar DEFAULT 'Qayerga'`,
    `ALTER TABLE "pages_locales" ADD COLUMN IF NOT EXISTS "hero_origin_label" varchar DEFAULT 'Qayerdan'`,
    `ALTER TABLE "pages_locales" ADD COLUMN IF NOT EXISTS "hero_destination_placeholder" varchar DEFAULT 'Shahar yoki aeroport'`,
    `ALTER TABLE "pages_locales" ADD COLUMN IF NOT EXISTS "hero_date_label" varchar DEFAULT 'Sana'`,
    `ALTER TABLE "pages_locales" ADD COLUMN IF NOT EXISTS "hero_search_button" varchar DEFAULT 'QIDIRISH'`,

    `ALTER TABLE "_pages_v_locales" ADD COLUMN IF NOT EXISTS "version_hero_background_type" "enum__pages_v_version_hero_background_type" DEFAULT 'images'`,
    `ALTER TABLE "_pages_v_locales" ADD COLUMN IF NOT EXISTS "version_hero_youtube_video_url" varchar`,
    `ALTER TABLE "_pages_v_locales" ADD COLUMN IF NOT EXISTS "version_hero_departure_tab" varchar DEFAULT 'UCHIB KETISH'`,
    `ALTER TABLE "_pages_v_locales" ADD COLUMN IF NOT EXISTS "version_hero_arrival_tab" varchar DEFAULT 'QO''NIB KELISH'`,
    `ALTER TABLE "_pages_v_locales" ADD COLUMN IF NOT EXISTS "version_hero_destination_label" varchar DEFAULT 'Qayerga'`,
    `ALTER TABLE "_pages_v_locales" ADD COLUMN IF NOT EXISTS "version_hero_origin_label" varchar DEFAULT 'Qayerdan'`,
    `ALTER TABLE "_pages_v_locales" ADD COLUMN IF NOT EXISTS "version_hero_destination_placeholder" varchar DEFAULT 'Shahar yoki aeroport'`,
    `ALTER TABLE "_pages_v_locales" ADD COLUMN IF NOT EXISTS "version_hero_date_label" varchar DEFAULT 'Sana'`,
    `ALTER TABLE "_pages_v_locales" ADD COLUMN IF NOT EXISTS "version_hero_search_button" varchar DEFAULT 'QIDIRISH'`,

    // --- parent_id and version_parent_id ---
    `ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "parent_id" integer`,
    `ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_parent_id" integer`,

    // --- pages_rels media_id ---
    `ALTER TABLE "pages_rels" ADD COLUMN IF NOT EXISTS "media_id" integer`,
    `ALTER TABLE "_pages_v_rels" ADD COLUMN IF NOT EXISTS "media_id" integer`,

    // --- user API keys ---
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "enable_a_p_i_key" boolean`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "api_key" varchar`,
    `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "api_key_index" varchar`,

    // --- search rels ---
    `ALTER TABLE "search_rels" ADD COLUMN IF NOT EXISTS "pages_id" integer`,

    // --- header / footer nav locale columns ---
    `ALTER TABLE "header_nav_items" ADD COLUMN IF NOT EXISTS "_locale" "_locales" NOT NULL DEFAULT 'uz'`,
    `ALTER TABLE "header_rels" ADD COLUMN IF NOT EXISTS "locale" "_locales"`,
    `ALTER TABLE "footer_nav_items" ADD COLUMN IF NOT EXISTS "_locale" "_locales" NOT NULL DEFAULT 'uz'`,
    `ALTER TABLE "footer_rels" ADD COLUMN IF NOT EXISTS "locale" "_locales"`,

    // --- payload_locked_documents / payload_preferences rels ---
    `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "payload_mcp_api_keys_id" integer`,
    `ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "payload_mcp_api_keys_id" integer`,
  ]

  for (const stmt of statements) {
    try {
      await db.execute(sql.raw(stmt))
    } catch (err: any) {
      // Log but continue — migration should not block startup
      console.warn(`[migration] Skipped statement (${err?.message ?? 'unknown error'}): ${stmt.slice(0, 80)}...`)
    }
  }

  // --- Create version tables (separate loop to keep migration readable) ---
  const versionTables = [
    `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_faq_questions" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" serial PRIMARY KEY NOT NULL, "question" varchar, "answer" varchar, "default_open" boolean DEFAULT false, "_uuid" varchar)`,
    `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_faq" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" serial PRIMARY KEY NOT NULL, "title" varchar, "description" varchar, "_uuid" varchar, "block_name" varchar)`,
    `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_gallery_images" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" serial PRIMARY KEY NOT NULL, "image_id" integer, "caption" varchar, "description" varchar, "_uuid" varchar)`,
    `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_gallery" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" serial PRIMARY KEY NOT NULL, "title" varchar, "subtitle" varchar, "layout" "enum__pages_v_blocks_gallery_layout" DEFAULT 'grid', "columns" "enum__pages_v_blocks_gallery_columns" DEFAULT '3', "enable_lightbox" boolean DEFAULT true, "show_captions" boolean DEFAULT true, "_uuid" varchar, "block_name" varchar)`,
    `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_testimonial" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" serial PRIMARY KEY NOT NULL, "quote" varchar, "author" varchar, "role" varchar, "company" varchar, "avatar_id" integer, "rating" "enum__pages_v_blocks_testimonial_rating" DEFAULT '5', "layout" "enum__pages_v_blocks_testimonial_layout" DEFAULT 'centered', "_uuid" varchar, "block_name" varchar)`,
    `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_contact_contact_info" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" serial PRIMARY KEY NOT NULL, "type" "enum__pages_v_blocks_contact_contact_info_type", "label" varchar, "value" varchar, "icon" varchar, "link" varchar, "_uuid" varchar)`,
    `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_contact_form_fields" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" serial PRIMARY KEY NOT NULL, "field_type" "enum__pages_v_blocks_contact_form_fields_field_type", "label" varchar, "name" varchar, "placeholder" varchar, "required" boolean DEFAULT false, "_uuid" varchar)`,
    `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_contact" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" serial PRIMARY KEY NOT NULL, "title" varchar, "subtitle" varchar, "show_map" boolean DEFAULT false, "map_embed_code" varchar, "layout" "enum__pages_v_blocks_contact_layout" DEFAULT 'split', "_uuid" varchar, "block_name" varchar)`,
    // These version tables already exist but we add them IF NOT EXISTS for safety
    `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_flights_table" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" serial PRIMARY KEY NOT NULL, "headline" varchar, "title" varchar, "subtitle" varchar, "departures_label" varchar DEFAULT 'Uchish', "arrivals_label" varchar DEFAULT 'Qo''nish', "table_headers_time" varchar DEFAULT 'Vaqt', "table_headers_destination" varchar DEFAULT 'Yo''nalish', "table_headers_flight" varchar DEFAULT 'Reys', "table_headers_airline" varchar DEFAULT 'Aviakompaniya', "table_headers_terminal" varchar DEFAULT 'Terminal', "table_headers_gate" varchar DEFAULT 'Chiqish', "table_headers_status" varchar DEFAULT 'Status', "airport_iata" varchar DEFAULT 'NVI', "refresh_interval" numeric DEFAULT 60, "_uuid" varchar, "block_name" varchar)`,
    `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_carousel_cards" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" serial PRIMARY KEY NOT NULL, "image_id" integer, "title" varchar, "subtitle" varchar, "button_text" varchar DEFAULT 'Batafsil', "button_link" varchar, "_uuid" varchar)`,
    `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_carousel" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" serial PRIMARY KEY NOT NULL, "background_image_id" integer, "main_heading" varchar, "subtitle" varchar, "all_services_button_text" varchar DEFAULT 'Barcha xizmatlar', "all_services_button_link" varchar, "settings_autoplay" boolean DEFAULT true, "settings_autoplay_delay" numeric DEFAULT 5000, "settings_show_dots" boolean DEFAULT true, "settings_show_navigation" boolean DEFAULT true, "_uuid" varchar, "block_name" varchar)`,
    `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_latest_news" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" serial PRIMARY KEY NOT NULL, "main_heading" varchar, "subtitle" varchar, "category_id" integer, "posts_limit" numeric DEFAULT 8, "read_more_text" varchar DEFAULT 'Read More', "all_news_button_text" varchar DEFAULT 'Barcha yangiliklar', "all_news_button_link" varchar DEFAULT '/news', "settings_show_navigation" boolean DEFAULT true, "settings_show_dots" boolean DEFAULT true, "settings_autoplay" boolean DEFAULT true, "settings_autoplay_delay" numeric DEFAULT 5000, "_uuid" varchar, "block_name" varchar)`,
    `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_info_cards_cards" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" serial PRIMARY KEY NOT NULL, "card_title" varchar, "card_description" varchar, "card_image_id" integer, "link_type" "enum__pages_v_blocks_info_cards_cards_link_type" DEFAULT 'reference', "link_new_tab" boolean, "link_url" varchar, "style" "enum__pages_v_blocks_info_cards_cards_style" DEFAULT 'default', "_uuid" varchar)`,
    `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_info_cards" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" serial PRIMARY KEY NOT NULL, "title" varchar, "subtitle" varchar, "_uuid" varchar, "block_name" varchar)`,
    `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_logo_carousel_logos" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" serial PRIMARY KEY NOT NULL, "logo_id" integer, "link" varchar, "new_tab" boolean DEFAULT true, "_uuid" varchar)`,
    `CREATE TABLE IF NOT EXISTS "_pages_v_blocks_logo_carousel" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" serial PRIMARY KEY NOT NULL, "background_color" "enum__pages_v_blocks_logo_carousel_background_color" DEFAULT 'white', "speed" numeric DEFAULT 30, "_uuid" varchar, "block_name" varchar)`,
  ]

  for (const stmt of versionTables) {
    try {
      await db.execute(sql.raw(stmt))
    } catch (err: any) {
      console.warn(`[migration] Skipped version table (${err?.message ?? 'unknown error'}): ${stmt.slice(0, 80)}...`)
    }
  }

  // --- Missing parent tables (flights, carousel, etc. - IF NOT EXISTS) ---
  const parentTables = [
    `CREATE TABLE IF NOT EXISTS "pages_blocks_flights_table" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "headline" varchar, "title" varchar, "subtitle" varchar, "departures_label" varchar DEFAULT 'Uchish', "arrivals_label" varchar DEFAULT 'Qo''nish', "table_headers_time" varchar DEFAULT 'Vaqt', "table_headers_destination" varchar DEFAULT 'Yo''nalish', "table_headers_flight" varchar DEFAULT 'Reys', "table_headers_airline" varchar DEFAULT 'Aviakompaniya', "table_headers_terminal" varchar DEFAULT 'Terminal', "table_headers_gate" varchar DEFAULT 'Chiqish', "table_headers_status" varchar DEFAULT 'Status', "airport_iata" varchar DEFAULT 'NVI', "refresh_interval" numeric DEFAULT 60, "block_name" varchar)`,
    `CREATE TABLE IF NOT EXISTS "pages_blocks_carousel_cards" ("_order" integer NOT NULL, "_parent_id" varchar NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "image_id" integer, "title" varchar, "subtitle" varchar, "button_text" varchar DEFAULT 'Batafsil', "button_link" varchar)`,
    `CREATE TABLE IF NOT EXISTS "pages_blocks_carousel" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "background_image_id" integer, "main_heading" varchar, "subtitle" varchar, "all_services_button_text" varchar DEFAULT 'Barcha xizmatlar', "all_services_button_link" varchar, "settings_autoplay" boolean DEFAULT true, "settings_autoplay_delay" numeric DEFAULT 5000, "settings_show_dots" boolean DEFAULT true, "settings_show_navigation" boolean DEFAULT true, "block_name" varchar)`,
    `CREATE TABLE IF NOT EXISTS "pages_blocks_latest_news" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "main_heading" varchar, "subtitle" varchar, "category_id" integer, "posts_limit" numeric DEFAULT 8, "read_more_text" varchar DEFAULT 'Read More', "all_news_button_text" varchar DEFAULT 'Barcha yangiliklar', "all_news_button_link" varchar DEFAULT '/news', "settings_show_navigation" boolean DEFAULT true, "settings_show_dots" boolean DEFAULT true, "settings_autoplay" boolean DEFAULT true, "settings_autoplay_delay" numeric DEFAULT 5000, "block_name" varchar)`,
    `CREATE TABLE IF NOT EXISTS "pages_blocks_info_cards_cards" ("_order" integer NOT NULL, "_parent_id" varchar NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "card_title" varchar, "card_description" varchar, "card_image_id" integer, "link_type" "enum_pages_blocks_info_cards_cards_link_type" DEFAULT 'reference', "link_new_tab" boolean, "link_url" varchar, "style" "enum_pages_blocks_info_cards_cards_style" DEFAULT 'default')`,
    `CREATE TABLE IF NOT EXISTS "pages_blocks_info_cards" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "title" varchar, "subtitle" varchar, "block_name" varchar)`,
    `CREATE TABLE IF NOT EXISTS "pages_blocks_logo_carousel_logos" ("_order" integer NOT NULL, "_parent_id" varchar NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "logo_id" integer, "link" varchar, "new_tab" boolean DEFAULT true)`,
    `CREATE TABLE IF NOT EXISTS "pages_blocks_logo_carousel" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "background_color" "enum_pages_blocks_logo_carousel_background_color" DEFAULT 'white', "speed" numeric DEFAULT 30, "block_name" varchar)`,
    `CREATE TABLE IF NOT EXISTS "pages_breadcrumbs" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "doc_id" integer, "url" varchar, "label" varchar)`,
    `CREATE TABLE IF NOT EXISTS "header_nav_items_sub_items" ("_order" integer NOT NULL, "_parent_id" varchar NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" varchar PRIMARY KEY NOT NULL, "link_type" "enum_header_nav_items_sub_items_link_type" DEFAULT 'reference', "link_new_tab" boolean, "link_url" varchar, "link_label" varchar NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS "payload_mcp_api_keys" ("id" serial PRIMARY KEY NOT NULL, "user_id" integer NOT NULL, "label" varchar, "description" varchar, "categories_find" boolean DEFAULT false, "categories_create" boolean DEFAULT false, "categories_update" boolean DEFAULT false, "categories_delete" boolean DEFAULT false, "pages_find" boolean DEFAULT false, "pages_create" boolean DEFAULT false, "pages_update" boolean DEFAULT false, "pages_delete" boolean DEFAULT false, "posts_find" boolean DEFAULT false, "posts_create" boolean DEFAULT false, "posts_update" boolean DEFAULT false, "posts_delete" boolean DEFAULT false, "media_find" boolean DEFAULT false, "media_create" boolean DEFAULT false, "media_update" boolean DEFAULT false, "media_delete" boolean DEFAULT false, "users_find" boolean DEFAULT false, "users_create" boolean DEFAULT false, "users_update" boolean DEFAULT false, "users_delete" boolean DEFAULT false, "redirects_find" boolean DEFAULT false, "redirects_create" boolean DEFAULT false, "redirects_update" boolean DEFAULT false, "redirects_delete" boolean DEFAULT false, "forms_find" boolean DEFAULT false, "forms_create" boolean DEFAULT false, "forms_update" boolean DEFAULT false, "forms_delete" boolean DEFAULT false, "form_submissions_find" boolean DEFAULT false, "form_submissions_create" boolean DEFAULT false, "form_submissions_update" boolean DEFAULT false, "form_submissions_delete" boolean DEFAULT false, "search_find" boolean DEFAULT false, "search_create" boolean DEFAULT false, "search_update" boolean DEFAULT false, "search_delete" boolean DEFAULT false, "payload_folders_find" boolean DEFAULT false, "payload_folders_create" boolean DEFAULT false, "payload_folders_update" boolean DEFAULT false, "payload_folders_delete" boolean DEFAULT false, "payload_mcp_api_keys_find" boolean DEFAULT false, "payload_mcp_api_keys_create" boolean DEFAULT false, "payload_mcp_api_keys_update" boolean DEFAULT false, "payload_mcp_api_keys_delete" boolean DEFAULT false, "payload_kv_find" boolean DEFAULT false, "payload_kv_create" boolean DEFAULT false, "payload_kv_update" boolean DEFAULT false, "payload_kv_delete" boolean DEFAULT false, "payload_jobs_find" boolean DEFAULT false, "payload_jobs_create" boolean DEFAULT false, "payload_jobs_update" boolean DEFAULT false, "payload_jobs_delete" boolean DEFAULT false, "payload_locked_documents_find" boolean DEFAULT false, "payload_locked_documents_create" boolean DEFAULT false, "payload_locked_documents_update" boolean DEFAULT false, "payload_locked_documents_delete" boolean DEFAULT false, "footer_find" boolean DEFAULT false, "footer_update" boolean DEFAULT false, "header_find" boolean DEFAULT false, "header_update" boolean DEFAULT false, "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL, "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL, "enable_a_p_i_key" boolean, "api_key" varchar, "api_key_index" varchar)`,
  ]

  for (const stmt of parentTables) {
    try {
      await db.execute(sql.raw(stmt))
    } catch (err: any) {
      console.warn(`[migration] Skipped parent table (${err?.message ?? 'unknown error'}): ${stmt.slice(0, 80)}...`)
    }
  }

  // --- Version breadcrumbs table ---
  try {
    await db.execute(sql.raw(`CREATE TABLE IF NOT EXISTS "_pages_v_version_breadcrumbs" ("_order" integer NOT NULL, "_parent_id" integer NOT NULL, "_path" text NOT NULL DEFAULT '', "_locale" "_locales" NOT NULL, "id" serial PRIMARY KEY NOT NULL, "doc_id" integer, "url" varchar, "label" varchar, "_uuid" varchar)`))
  } catch (err: any) {
    console.warn(`[migration] Skipped breadcrumbs: ${err?.message}`)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Down migration is intentionally minimal - we only add, never remove
  console.warn('[migration] Down migration not implemented for safe migration')
}
