create table states(
    id bigserial PRIMARY KEY,
    state_name text,
    state_polygon geometry,
    state_coordinates jsonb,
    is_deleted boolean default false,
    updated_at timestamp with time zone default now()
);

create unique index state_name on states (state_name);
create index states_polygon on states using gist(state_polygon);
create index states_polygon_not_deleted on states using gist(state_polygon) where is_deleted = false;

create table residents(
    id bigserial PRIMARY KEY,
    first_name text,
    last_name text,
    geog geometry,
    coordinates jsonb,
    state_id bigint,
    is_dead boolean default false,
    updated_at timestamp with time zone default now()
);

create index resident_geog on residents using gist(geog);
create index resident_not_dead on residents using gist(geog) where is_dead = false;
create index resident_state_id_is_dead on residents(state_id) where is_dead = false;